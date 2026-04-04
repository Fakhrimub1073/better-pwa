/**
 * Eleventy config — better-pwa docs site.
 * Run: npx @11ty/eleventy --serve  (from project root)
 */
export default function (eleventyConfig) {
  // Copy CSS directly to /css/ in output
  eleventyConfig.addPassthroughCopy({ "docs/src/public/css": "css" });
  
  // Copy JS, images, favicon to root
  eleventyConfig.addPassthroughCopy({ "docs/src/public/js": "js" });
  eleventyConfig.addPassthroughCopy({ "docs/src/public/images": "images" });
  eleventyConfig.addPassthroughCopy({ "docs/src/public/favicon.ico": "favicon.ico" });

  // Shortcodes
  eleventyConfig.addShortcode("currentYear", () => String(new Date().getFullYear()));

  return {
    dir: {
      input: "docs/src",
      output: "docs/_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
