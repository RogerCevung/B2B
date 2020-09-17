import Zone from "@insite/client-framework/Components/Zone";
import PageModule from "@insite/client-framework/Types/PageModule";
import PageProps from "@insite/client-framework/Types/PageProps";
import Page from "@insite/mobius/Page";
import React from "react";

const Account = ({ id }: PageProps) => (
    <Page>
        <Zone contentId={id} zoneName="Content" requireRows />
    </Page>
);

const pageModule: PageModule = {
    component: Account,
    definition: {
        hasEditableUrlSegment: false,
        hasEditableTitle: false,
        pageType: "System",
    },
};

export default pageModule;
