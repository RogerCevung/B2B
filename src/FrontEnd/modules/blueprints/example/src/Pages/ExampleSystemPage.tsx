import Zone from "@insite/client-framework/Components/Zone";
import PageModule from "@insite/client-framework/Types/PageModule";
import PageProps from "@insite/client-framework/Types/PageProps";
import AddToListModal from "@insite/content-library/Components/AddToListModal";
import Page from "@insite/mobius/Page";
import React from "react";

const ExamplePage = ({ id }: PageProps) => {
    return (
        <Page>
            <Zone contentId={id} zoneName="Content"></Zone>
            <AddToListModal />
        </Page>
    );
};

const pageModule: PageModule = {
    component: ExamplePage,
    definition: {
        hasEditableUrlSegment: true,
        hasEditableTitle: true,
        fieldDefinitions: [],
        pageType: "System",
    },
};

export default pageModule;
