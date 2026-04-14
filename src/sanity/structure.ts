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
      S.listItem()
        .title("Analytics")
        .child(
          S.list()
            .title("Analytics")
            .items([
              S.documentTypeListItem("metricDefinition").title("Metric Definitions"),
              S.documentTypeListItem("dashboardWidget").title("Dashboard Widgets"),
              S.documentTypeListItem("kpiTarget").title("KPI Targets"),
              S.documentTypeListItem("metricSnapshot").title("Metric Snapshots"),
              S.documentTypeListItem("syncLog").title("Sync Logs"),
            ])
        ),
      S.documentTypeListItem("caseStudy").title("Case Studies"),
      S.documentTypeListItem("post").title("Blog Posts"),
      ...S.documentTypeListItems().filter(
        (item) => !["caseStudy", "post", "siteSettings", "metricDefinition", "dashboardWidget", "kpiTarget", "metricSnapshot", "syncLog"].includes(item.getId() ?? "")
      ),
    ]);
