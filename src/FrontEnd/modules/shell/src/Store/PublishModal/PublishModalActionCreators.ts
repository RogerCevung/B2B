import { SafeDictionary } from "@insite/client-framework/Common/Types";
import { loadPage } from "@insite/client-framework/Store/Data/Pages/PagesActionCreators";
import { ToastContextData } from "@insite/mobius/Toast/ToasterContext";
import { PublishPageSelection } from "@insite/shell/Components/Shell/PublishModal";
import { closeSiteHole, sendToSite } from "@insite/shell/Components/Shell/SiteHole";
import {
    getPageBulkPublishInfo,
    getPagePublishInfo,
    getPublishedPageVersions,
    PageVersionInfoModel,
    publishPages,
    restorePageVersion,
} from "@insite/shell/Services/ContentAdminService";
import { PublishModalState } from "@insite/shell/Store/PublishModal/PublishModalState";
import { AnyShellAction } from "@insite/shell/Store/Reducers";
import { getCurrentPageForShell } from "@insite/shell/Store/ShellSelectors";
import ShellThunkAction from "@insite/shell/Store/ShellThunkAction";
import { Location } from "history";
import cloneDeep from "lodash/cloneDeep";

export const showPublishModal = (isBulkPublish?: true): AnyShellAction => ({
    type: "PublishModal/SetShowModal",
    showModal: true,
    isBulkPublish,
});

export const setPublishButtonExpanded = (publishButtonExpanded: boolean): AnyShellAction => ({
    type: "PublishModal/SetPublishButtonExpanded",
    publishButtonExpanded,
});

export const closePublishModal = (): AnyShellAction => ({
    type: "PublishModal/SetShowModal",
    showModal: false,
});

export const togglePublishInTheFuture = (): AnyShellAction => ({
    type: "PublishModal/TogglePublishInTheFuture",
});

export const setPublishOn = (publishOn: Date | undefined): AnyShellAction => ({
    type: "PublishModal/SetPublishOn",
    publishOn,
});

export const setRollbackOn = (rollbackOn: Date | undefined): AnyShellAction => ({
    type: "PublishModal/SetRollbackOn",
    rollbackOn,
});

export const setIsSelected = (index: number, isSelected: boolean): AnyShellAction => ({
    type: "PublishModal/SetIsSelected",
    index,
    isSelected,
});

export const setIsSelectedForAll = (isSelected: boolean): AnyShellAction => ({
    type: "PublishModal/SetIsSelectedForAll",
    isSelected,
});

export const loadPublishInfo = (pageId: string): ShellThunkAction => async (dispatch, getState) => {
    if (getState().publishModal.pagePublishInfosState.isLoading) {
        return;
    }

    dispatch({
        type: "PublishModal/BeginLoadingPublishInfo",
    });

    const pagePublishInfo = await getPagePublishInfo(pageId);

    dispatch({
        type: "PublishModal/CompleteLoadingPublishInfo",
        pagePublishInfos: pagePublishInfo,
    });
};

export const loadAllPagePublishInfo = (pageId: string): ShellThunkAction => async (dispatch, getState) => {
    dispatch({
        type: "PublishModal/BeginLoadingPublishInfo",
    });

    const state = getState();

    if (!state.publishModal.isBulkPublish) {
        const pagePublishInfo = await getPagePublishInfo(pageId);

        let futurePublish: Date | null = null;
        const futurePublishedPageInfo = pagePublishInfo.find(o => o.futurePublishOn);
        if (futurePublishedPageInfo) {
            futurePublish = new Date(futurePublishedPageInfo.futurePublishOn);
        }

        let rollbackOn: Date | null = null;
        const rollbackOnPageInfo = pagePublishInfo.find(o => o.rollbackOn);
        if (rollbackOnPageInfo) {
            rollbackOn = new Date(rollbackOnPageInfo.rollbackOn);
        }

        const isEditingExistingPublish = !!futurePublish || !!rollbackOn;

        dispatch({
            type: "PublishModal/CompleteLoadingPublishInfo",
            pagePublishInfos: pagePublishInfo,
            publishOn: futurePublish,
            rollbackOn,
            isEditingExistingPublish,
            failedPageIds: null,
        });

        if (
            ((futurePublish || rollbackOn) && !state.publishModal.publishInTheFuture) ||
            (!futurePublish && !rollbackOn && state.publishModal.publishInTheFuture)
        ) {
            dispatch({ type: "PublishModal/TogglePublishInTheFuture" });
        }
    } else {
        const pagePublishInfos = await getPageBulkPublishInfo();
        dispatch({
            type: "PublishModal/CompleteLoadingPublishInfo",
            pagePublishInfos,
            publishOn: null,
            rollbackOn: null,
            isEditingExistingPublish: false,
            failedPageIds: null,
        });

        if (state.publishModal.publishInTheFuture) {
            dispatch({ type: "PublishModal/TogglePublishInTheFuture" });
        }
    }
};

export const publish = (toasterContext: ToastContextData): ShellThunkAction => async (dispatch, getState) => {
    const state = getState();
    const currentPage = getCurrentPageForShell(state);
    const {
        shellContext: { permissions },
        publishModal: {
            pagePublishInfoIsSelected,
            pagePublishInfosState,
            failedToPublishPageIds,
            isBulkPublish,
            publishInTheFuture,
            publishOn,
            rollbackOn,
        },
    } = state;
    const pages: SafeDictionary<PublishPageSelection> = {};
    for (let x = 0; x < pagePublishInfoIsSelected.length; x += 1) {
        if (!pagePublishInfoIsSelected[x]) {
            continue;
        }

        const pagePublishInfo = pagePublishInfosState.value![x];
        let pageGroup = pages[pagePublishInfo.pageId];

        if (failedToPublishPageIds && failedToPublishPageIds[pagePublishInfo.pageId]) {
            continue;
        }

        if (!pageGroup) {
            pageGroup = pages[pagePublishInfo.pageId] = {
                pageId: pagePublishInfo.pageId,
                parentId: isBulkPublish ? null : currentPage.parentId,
                contexts: [],
            };
        }

        pageGroup.contexts.push(pagePublishInfo);
    }

    const pagesToPublish = [];
    for (const val of Object.values(pages)) {
        if (val) {
            pagesToPublish.push(val);
        }
    }

    const actualPublishOn = publishInTheFuture ? publishOn : undefined;
    const actualRollbackOn = publishInTheFuture ? rollbackOn : undefined;

    const publishResult = await publishPages({
        pages: pagesToPublish,
        futurePublish: !!publishInTheFuture,
        publishOn: actualPublishOn,
        rollbackOn: actualRollbackOn,
    });

    if (!publishResult.success) {
        const previousIds = state.publishModal.failedToPublishPageIds
            ? cloneDeep(state.publishModal.failedToPublishPageIds)
            : {};
        publishResult.errorInfos.forEach(o => {
            previousIds[o.pageId] = true;
        });
        dispatch({
            type: "PublishModal/SetFailedToPublishPageIds",
            failedPageIds: previousIds,
        });
        return;
    }

    dispatch(loadPublishInfo(getCurrentPageForShell(state).id));

    dispatch(closePublishModal());

    for (const page of pagesToPublish) {
        dispatch({
            type: "PageTree/UpdatePageState",
            pageId: page.pageId,
            parentId: page.parentId,
            publishOn: publishOn && rollbackOn && rollbackOn > publishOn ? rollbackOn : publishOn || rollbackOn,
            isWaitingForApproval: !permissions?.canPublishContent,
        });
    }

    if (!permissions?.canPublishContent) {
        toasterContext.addToast({
            body:
                pagesToPublish.length > 1
                    ? "Pages submitted for approval"
                    : `The Page ${currentPage.name} submitted for approval`,
            messageType: "success",
        });
    }

    if (!pagesToPublish.some(o => o.pageId === currentPage.id)) {
        return;
    }

    sendToSite({
        type: "CMSPermissions",
        permissions: state.shellContext.permissions,
        canChangePage: Math.max(publishOn?.getTime() || 0, rollbackOn?.getTime() || 0) <= Date.now(),
    });

    sendToSite({ type: "Reload" });
    closeSiteHole();

    // we need to get the model selection dropdowns to reload so they retrigger selecting product/category/brand
    dispatch({
        type: "Data/Pages/Reset",
    });
    dispatch(loadPage({ pathname: `/Content/Page/${currentPage.id}`, search: "" } as Location));
};

export const configureComparison = (compareVersions?: PublishModalState["compareVersions"]): AnyShellAction => ({
    type: "PublishModal/ConfigureComparison",
    compareVersions,
});

export const loadPublishedPageVersions = (pageId: string): ShellThunkAction => async dispatch => {
    dispatch({
        type: "PublishModal/BeginLoadingPublishedPageVersions",
    });

    const pageVersions = await getPublishedPageVersions(pageId);
    dispatch({
        type: "PublishModal/CompleteLoadingPublishedPageVersions",
        pageVersions,
    });
};

export const restoreVersion = (
    pageVersion: PageVersionInfoModel,
    pageId: string,
): ShellThunkAction => async dispatch => {
    const result = await restorePageVersion(pageVersion.versionId);
    if (result.success) {
        dispatch({
            type: "PublishModal/CompletePageVersionRestore",
            pageVersion,
        });

        // we need to get the model selection dropdowns to reload so they retrigger selecting product/category/brand
        dispatch({
            type: "Data/Pages/Reset",
        });

        dispatch(loadPage({ pathname: `/Content/Page/${pageId}`, search: "" } as Location));
    }
};
