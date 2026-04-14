import { CogIcon } from "@sanity/icons";
import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site Settings")
        .icon(CogIcon)
        .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Site Settings")),
      S.documentTypeListItem("caseStudy").title("Case Studies"),
      S.documentTypeListItem("post").title("Blog Posts"),
      ...S.documentTypeListItems().filter((item) => !["caseStudy", "post", "siteSettings"].includes(item.getId() ?? "")),
    ]);
