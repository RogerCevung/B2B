import Zone from "@insite/client-framework/Components/Zone";
import PageModule from "@insite/client-framework/Types/PageModule";
import PageProps from "@insite/client-framework/Types/PageProps";
import Page from "@insite/mobius/Page";
import * as React from "react";

const LocationFinderPage = ({ id }: PageProps) => (
    <Page>
        <Zone contentId={id} zoneName="Content" />
    </Page>
);
const pageModule: PageModule = {
    component: LocationFinderPage,
    definition: {
        hasEditableUrlSegment: true,
        hasEditableTitle: true,
        pageType: "System",
    },
};

export default pageModule;

export const LocationFinderPageContext = "LocationFinderPage";
