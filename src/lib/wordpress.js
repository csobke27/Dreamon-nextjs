const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_BASE ??
  "https://public-api.wordpress.com/wp/v2/sites/coreytestblog4.wordpress.com/";

const SORT_MAP = {
  date: { orderby: "date", order: "desc" },
  "date-reverse": { orderby: "date", order: "asc" },
  title: { orderby: "title", order: "asc" },
  "title-reverse": { orderby: "title", order: "desc" },
};

function buildUrl(pathname, params = {}) {
  const url = new URL(pathname, WP_API_BASE);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

async function fetchWordPress(pathname, params = {}) {
  const response = await fetch(buildUrl(pathname, params), {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`WordPress request failed for ${pathname} with status ${response.status}`);
  }

  return response;
}

export function normalizeSortOrder(sortOrder) {
  return SORT_MAP[sortOrder] ? sortOrder : "date";
}

export async function getBlogCategories() {
  try {
    const response = await fetchWordPress("categories");
    return (await response.json()) ?? [];
  } catch {
    return [];
  }
}

export async function getBlogPosts({ page = 1, categoryId = "", sortOrder = "date" } = {}) {
  try {
    const sortConfig = SORT_MAP[normalizeSortOrder(sortOrder)];
    const response = await fetchWordPress("posts", {
      page,
      per_page: 5,
      categories: categoryId,
      orderby: sortConfig.orderby,
      order: sortConfig.order,
    });

    const posts = (await response.json()) ?? [];
    const totalPages = Number.parseInt(response.headers.get("X-WP-TotalPages") ?? "0", 10) || 0;

    return {
      posts,
      totalPages,
      currentPage: page,
    };
  } catch {
    return {
      posts: [],
      totalPages: 0,
      currentPage: 1,
    };
  }
}

export async function getPostBySlug(slug) {
  try {
    const response = await fetchWordPress("posts", { slug });
    const posts = (await response.json()) ?? [];

    return posts[0] ?? null;
  } catch {
    return null;
  }
}

export async function getRelatedPosts(categoryIds = [], excludedPostId) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    return [];
  }

  try {
    const response = await fetchWordPress("posts", {
      categories: categoryIds.join(","),
      per_page: 2,
      exclude: excludedPostId,
    });

    return (await response.json()) ?? [];
  } catch {
    return [];
  }
}

export async function getNyxLegacyPosts() {
  try {
    const categoryResponse = await fetchWordPress("categories", { slug: "nyx-legacy" });
    const categories = (await categoryResponse.json()) ?? [];
    const nyxCategory = categories[0];

    if (!nyxCategory) {
      return [];
    }

    const postsResponse = await fetchWordPress("posts", {
      per_page: 3,
      categories: nyxCategory.id,
    });

    return (await postsResponse.json()) ?? [];
  } catch {
    return [];
  }
}