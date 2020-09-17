import Zone from "@insite/client-framework/Components/Zone";
import PageModule from "@insite/client-framework/Types/PageModule";
import PageProps from "@insite/client-framework/Types/PageProps";
import AddToListModal from "@insite/content-library/Components/AddToListModal";
import Page from "@insite/mobius/Page";
import React from "react";
import { css } from "styled-components";

const HomePage: React.FunctionComponent<PageProps> = ({ id }) => (
    <Page
        css={css`
            background: #e6f7ec;
        `}
    >
        <Zone contentId={id} zoneName="Content" requireRows />
        <AddToListModal />
    </Page>
);

const pageModule: PageModule = {
    component: HomePage,
    definition: {
        hasEditableTitle: true,
        hasEditableUrlSegment: false,
        pageType: "System",
    },
};

export default pageModule;

export const HomePageContext = "HomePage";
