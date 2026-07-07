import { 
  LinkedInProfile, 
  LinkedInPostRecord, 
  LinkedInAnalyticsSummary, 
  IngestionResult, 
  ReactionTypeCount 
} from '@/types';export function normalizePostUrl(url: string | null, activityUrn: string | null): string | null {
  let resultUrl = '';
  if (!url) {
    if (!activityUrn) return null;
    const numericId = activityUrn.split(':').pop();
    if (numericId && /^\d+$/.test(numericId)) {
      resultUrl = `https://www.linkedin.com/posts/activity-${numericId}`;
    } else {
      resultUrl = `https://www.linkedin.com/feed/update/${activityUrn}`;
    }
  } else {
    let trimmed = url.trim();
    if (trimmed.startsWith('//')) {
      resultUrl = `https:${trimmed}`;
    } else if (trimmed.startsWith('/')) {
      resultUrl = `https://www.linkedin.com${trimmed}`;
    } else if (!/^https?:\/\//i.test(trimmed)) {
      resultUrl = `https://${trimmed}`;
    } else {
      resultUrl = trimmed;
    }
  }

  // Strip query tracking params
  if (resultUrl.includes('linkedin.com/posts/') || resultUrl.includes('linkedin.com/feed/update/')) {
    const qIndex = resultUrl.indexOf('?');
    if (qIndex !== -1) {
      resultUrl = resultUrl.substring(0, qIndex);
    }
  }
  return resultUrl;
}

export function extractNumericId(urn: string | null): string | null {
  if (!urn) return null;
  const match = urn.match(/\d+$/);
  return match ? match[0] : null;
}


export function validateCookies(liAt: string, jsessionid: string): void {
  if (!liAt || typeof liAt !== 'string' || liAt.trim() === '') {
    throw new Error("Missing credentials: 'li_at' cookie is required.");
  }
  if (!jsessionid || typeof jsessionid !== 'string' || jsessionid.trim() === '') {
    throw new Error("Missing credentials: 'JSESSIONID' cookie/CSRF token is required.");
  }
  
  if (liAt.includes('YOUR_') || jsessionid.includes('YOUR_')) {
    throw new Error("Invalid credentials: Please replace placeholders with actual session cookies.");
  }
}

export function getHeaders(liAt: string, jsessionid: string): Record<string, string> {
  const cleanJsessionid = jsessionid.replace(/^"|"$/g, '');
  
  return {
    'csrf-token': cleanJsessionid,
    'cookie': `JSESSIONID="${cleanJsessionid}"; li_at=${liAt}`,
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'accept': 'application/vnd.linkedin.normalized+json+2.1',
    'x-restli-protocol-version': '2.0.0',
    'x-li-track': JSON.stringify({ clientVersion: '1.13.21', osName: 'web', deviceFormFactor: 'DESKTOP', mpName: 'voyager-web' }),
  };
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function getProfile(headers: Record<string, string>): Promise<LinkedInProfile & { dashUrn: string }> {
  let response: Response;
  try {
    response = await fetchWithTimeout('https://www.linkedin.com/voyager/api/me', {
      method: 'GET',
      headers,
    });
  } catch (error: any) {
    throw new Error(`Profile connection failed: ${error.message}`);
  }

  if (response.status === 401) {
    throw new Error('Authentication failed: The provided session cookies are invalid or expired.');
  }
  if (response.status === 429) {
    throw new Error('Rate limited: Too many requests. LinkedIn has throttled the current IP/session.');
  }
  if (!response.ok) {
    throw new Error(`Profile fetch failed: HTTP ${response.status} ${response.statusText}`);
  }

  const profileResponse = await response.json();
  const data = profileResponse?.data;
  if (!data) {
    throw new Error('Profile fetch failed: Received empty response body from LinkedIn Voyager API.');
  }

  const miniProfileUrn = data['*miniProfile'];
  if (!miniProfileUrn) {
    throw new Error('Voyager response changed: No miniProfile reference (*miniProfile) found in profile payload.');
  }

  const included = profileResponse.included || [];
  const miniProfile = included.find((item: any) => item.entityUrn === miniProfileUrn);
  if (!miniProfile) {
    throw new Error(`Unexpected schema: No included entity matched miniProfile URN: ${miniProfileUrn}`);
  }

  const dashUrn = miniProfile.dashEntityUrn;
  if (!dashUrn) {
    throw new Error('Unexpected schema: Resolved miniProfile has no dashEntityUrn. Cannot retrieve posts.');
  }

  let pictureObj = miniProfile.picture || miniProfile.profilePicture;
  if (!pictureObj) {
    if (miniProfile['*picture']) {
      pictureObj = included.find((item: any) => item.entityUrn === miniProfile['*picture']);
    } else if (miniProfile['*profilePicture']) {
      pictureObj = included.find((item: any) => item.entityUrn === miniProfile['*profilePicture']);
    }
  }

  function resolveAvatarUrl(pObj: any): string | null {
    if (!pObj) return null;
    
    // Check various paths for standard vector image
    const vImg = pObj['com.linkedin.common.VectorImage'] || 
                 pObj.displayImage?.['com.linkedin.common.VectorImage'] || 
                 pObj.displayImage || 
                 pObj.vectorImage || 
                 pObj;
                 
    if (vImg && typeof vImg === 'object' && vImg.rootUrl && Array.isArray(vImg.artifacts) && vImg.artifacts.length > 0) {
      const rootUrl = vImg.rootUrl;
      const largestArtifact = [...vImg.artifacts].sort((a, b) => (b.width || 0) - (a.width || 0))[0];
      const segment = largestArtifact?.fileIdentifyingUrlPathSegment;
      if (rootUrl && segment) {
        let full = rootUrl + segment;
        if (!full.startsWith('http')) {
          full = 'https://' + full.replace(/^\/+/g, '');
        }
        return full;
      }
    }

    // Recursive scanner fallback for any media licdn string URL
    const scan = (val: any): string | null => {
      if (!val) return null;
      if (typeof val === 'string' && (val.startsWith('https://media.licdn.com') || val.includes('.licdn.com/dms/image/'))) {
        return val;
      }
      if (typeof val === 'object') {
        for (const k in val) {
          const r = scan(val[k]);
          if (r) return r;
        }
      }
      return null;
    };
    return scan(pObj);
  }

  const avatarUrl = resolveAvatarUrl(pictureObj);

  return {
    fullName: `${miniProfile.firstName || ''} ${miniProfile.lastName || ''}`.trim(),
    occupation: miniProfile.occupation || null,
    publicIdentifier: miniProfile.publicIdentifier || null,
    profileUrl: miniProfile.publicIdentifier ? `https://www.linkedin.com/in/${miniProfile.publicIdentifier}` : null,
    avatarUrl,
    dashUrn,
  };
}

export async function getPosts(headers: Record<string, string>, dashUrn: string): Promise<any> {
  const postsUrl = `https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(count:20,start:0,profileUrn:${encodeURIComponent(dashUrn)})&queryId=voyagerFeedDashProfileUpdates.4af00b28d60ed0f1488018948daad822`;
  
  try {
    const response = await fetchWithTimeout(postsUrl, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Posts fetch failed: HTTP ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error: any) {
    throw new Error(`Posts fetch failed: ${error.message}`);
  }
}

export function buildPostRecords(postsResponse: any): LinkedInPostRecord[] {
  if (!postsResponse || !postsResponse.included) {
    return [];
  }

  const included = postsResponse.included;

  // Index SocialActivityCounts by activity URN and numeric ID
  const countsByActivity: Record<string, any> = {};
  for (const item of included) {
    if (item.$type === 'com.linkedin.voyager.dash.feed.SocialActivityCounts' && item.urn) {
      countsByActivity[item.urn] = item;
      const numId = extractNumericId(item.urn);
      if (numId) countsByActivity[numId] = item;
    }
  }

  // Index Update objects by their backend activity URN and numeric ID
  const updatesByActivity: Record<string, any> = {};
  for (const item of included) {
    if (item.$type === 'com.linkedin.voyager.dash.feed.Update' && item.metadata?.backendUrn) {
      updatesByActivity[item.metadata.backendUrn] = item;
      const numId = extractNumericId(item.metadata.backendUrn);
      if (numId) updatesByActivity[numId] = item;
    }
  }

  // Extract ordered activity URNs from the feed element pointers
  const elementUrns: string[] = postsResponse.data?.data?.feedDashProfileUpdatesByMemberShareFeed?.['*elements'] || [];
  const activityUrns = [...new Set(
    elementUrns
      .map(u => {
        const match = u.match(/urn:li:activity:\d+/);
        return match ? match[0] : '';
      })
      .filter(Boolean)
  )];

  return activityUrns.map(activityUrn => {
    const numId = extractNumericId(activityUrn);
    const update = updatesByActivity[activityUrn] || (numId ? updatesByActivity[numId] : undefined);
    const counts = countsByActivity[activityUrn] || (numId ? countsByActivity[numId] : undefined);

    const numLikes = counts?.numLikes ?? 0;
    const numComments = counts?.numComments ?? 0;
    const numShares = counts?.numShares ?? 0;
    const numImpressions = counts?.numImpressions ?? 0;
    const engagementScore = numLikes + numComments + numShares;

    const reactionBreakdownRaw = counts?.reactionTypeCounts ?? [];
    const reactionBreakdown: ReactionTypeCount[] = reactionBreakdownRaw.map((r: any) => ({
      reactionType: r.reactionType || 'LIKE',
      count: r.count || 0
    }));

    return {
      activityUrn,
      text: update?.commentary?.text?.text ?? null,
      postUrl: normalizePostUrl(update?.socialContent?.shareUrl || null, activityUrn),
      postedRelative: update?.actor?.subDescription?.text?.replace('•', '').trim() ?? null,
      numLikes,
      numComments,
      numShares,
      numImpressions,
      engagementScore,
      engagementRate: numImpressions > 0 ? +(engagementScore / numImpressions * 100).toFixed(2) : 0,
      reactionBreakdown,
      missingUpdateObject: !update,
      rank: 0, // Assigned later in rankPosts
    };
  });
}

export function rankPosts(postRecords: LinkedInPostRecord[]): LinkedInPostRecord[] {
  postRecords.sort((a, b) => {
    if (b.engagementScore !== a.engagementScore) {
      return b.engagementScore - a.engagementScore;
    }
    return b.engagementRate - a.engagementRate;
  });

  postRecords.forEach((post, index) => {
    post.rank = index + 1;
  });

  return postRecords;
}

export function calculateSummary(postRecords: LinkedInPostRecord[]): LinkedInAnalyticsSummary {
  const postsFound = postRecords.length;

  if (postsFound === 0) {
    return {
      postsFound: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalImpressions: 0,
      averageLikes: 0,
      averageComments: 0,
      averageShares: 0,
      averageImpressions: 0,
      averageEngagementRate: 0,
      highestEngagementPost: null,
      highestViewedPost: null,
      lowestPerformingPost: null,
    };
  }

  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;
  let totalImpressions = 0;
  let sumEngagementRate = 0;

  let highestEngagementPost = postRecords[0];
  let highestViewedPost = postRecords[0];
  let lowestPerformingPost = postRecords[0];

  for (const post of postRecords) {
    totalLikes += post.numLikes;
    totalComments += post.numComments;
    totalShares += post.numShares;
    totalImpressions += post.numImpressions;
    sumEngagementRate += post.engagementRate;

    const isHigherEngagement = 
      post.engagementScore > highestEngagementPost.engagementScore ||
      (post.engagementScore === highestEngagementPost.engagementScore && post.engagementRate > highestEngagementPost.engagementRate);
      
    if (isHigherEngagement) {
      highestEngagementPost = post;
    }

    if (post.numImpressions > highestViewedPost.numImpressions) {
      highestViewedPost = post;
    }

    const isLowerPerformance = 
      post.engagementScore < lowestPerformingPost.engagementScore ||
      (post.engagementScore === lowestPerformingPost.engagementScore && post.engagementRate < lowestPerformingPost.engagementRate);
      
    if (isLowerPerformance) {
      lowestPerformingPost = post;
    }
  }

  return {
    postsFound,
    totalLikes,
    totalComments,
    totalShares,
    totalImpressions,
    averageLikes: +(totalLikes / postsFound).toFixed(2),
    averageComments: +(totalComments / postsFound).toFixed(2),
    averageShares: +(totalShares / postsFound).toFixed(2),
    averageImpressions: +(totalImpressions / postsFound).toFixed(2),
    averageEngagementRate: +(sumEngagementRate / postsFound).toFixed(2),
    highestEngagementPost,
    highestViewedPost,
    lowestPerformingPost,
  };
}

export function buildAnalytics(postsResponse: any): { summary: LinkedInAnalyticsSummary; posts: LinkedInPostRecord[] } {
  const records = buildPostRecords(postsResponse);
  const rankedRecords = rankPosts(records);
  const summary = calculateSummary(rankedRecords);

  return {
    summary,
    posts: rankedRecords,
  };
}

export async function runVoyagerAnalytics(liAt: string, jsessionid: string): Promise<IngestionResult> {
  validateCookies(liAt, jsessionid);
  const headers = getHeaders(liAt, jsessionid);

  // 1. Fetch profile
  const profileInfo = await getProfile(headers);
  const { dashUrn, ...profileSummary } = profileInfo;

  // 2. Fetch posts and compute analytics
  try {
    const postsResponse = await getPosts(headers, dashUrn);
    const { summary, posts } = buildAnalytics(postsResponse);

    return {
      success: true,
      profile: profileSummary,
      analytics: summary,
      posts,
    };
  } catch (postsError: any) {
    const emptySummary = calculateSummary([]);

    return {
      success: true,
      profile: profileSummary,
      analytics: emptySummary,
      posts: [],
      postsError: postsError.message,
    };
  }
}
