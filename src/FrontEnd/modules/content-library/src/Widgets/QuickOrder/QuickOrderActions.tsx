import StyledWrapper from "@insite/client-framework/Common/StyledWrapper";
import { makeHandlerChainAwaitable } from "@insite/client-framework/HandlerCreator";
import siteMessage from "@insite/client-framework/SiteMessage";
import ApplicationState from "@insite/client-framework/Store/ApplicationState";
import setAddToListModalIsOpen from "@insite/client-framework/Store/Components/AddToListModal/Handlers/SetAddToListModalIsOpen";
import { getSettingsCollection } from "@insite/client-framework/Store/Context/ContextSelectors";
import addCartLines from "@insite/client-framework/Store/Data/Carts/Handlers/AddCartLines";
import loadCurrentCart from "@insite/client-framework/Store/Data/Carts/Handlers/LoadCurrentCart";
import { getPageLinkByPageType } from "@insite/client-framework/Store/Links/LinksSelectors";
import clearProducts from "@insite/client-framework/Store/Pages/QuickOrder/Handlers/ClearProducts";
import translate from "@insite/client-framework/Translate";
import WidgetModule from "@insite/client-framework/Types/WidgetModule";
import WidgetProps from "@insite/client-framework/Types/WidgetProps";
import { QuickOrderPageContext } from "@insite/content-library/Pages/QuickOrderPage";
import Button, { ButtonPresentationProps } from "@insite/mobius/Button";
import Clickable from "@insite/mobius/Clickable";
import { BaseTheme } from "@insite/mobius/globals/baseTheme";
import Hidden, { HiddenProps } from "@insite/mobius/Hidden";
import OverflowMenu, { OverflowMenuPresentationProps } from "@insite/mobius/OverflowMenu";
import ToasterContext from "@insite/mobius/Toast/ToasterContext";
import breakpointMediaQueries from "@insite/mobius/utilities/breakpointMediaQueries";
import { HasHistory, withHistory } from "@insite/mobius/utilities/HistoryContext";
import InjectableCss from "@insite/mobius/utilities/InjectableCss";
import React, { FC, useState } from "react";
import { connect, ResolveThunks } from "react-redux";
import { css } from "styled-components";

const enum fields {
    useOverflowMenu = "useOverflowMenu",
}

interface OwnProps extends WidgetProps {
    fields: {
        [fields.useOverflowMenu]: boolean;
    };
}

const mapStateToProps = (state: ApplicationState) => {
    const settingsCollection = getSettingsCollection(state);
    return {
        productInfos: state.pages.quickOrder.productInfos,
        orderUploadPageLink: getPageLinkByPageType(state, "OrderUploadPage"),
        cartPageLink: getPageLinkByPageType(state, "CartPage"),
        showAddToCartConfirmationDialog: settingsCollection.productSettings.showAddToCartConfirmationDialog,
        canOrderUpload: settingsCollection.orderSettings.canOrderUpload,
    };
};

const mapDispatchToProps = {
    setAddToListModalIsOpen,
    addCartLines: makeHandlerChainAwaitable(addCartLines),
    clearProducts,
    loadCurrentCart,
};

type Props = OwnProps & ResolveThunks<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps> & HasHistory;

export interface QuickOrderActionsStyles {
    wrapper?: InjectableCss;
    buttonsHidden?: HiddenProps;
    menuHidden?: HiddenProps;
    overflowMenu?: OverflowMenuPresentationProps;
    addAllToCartButton?: ButtonPresentationProps;
    addToListButton?: ButtonPresentationProps;
    uploadOrderButton?: ButtonPresentationProps;
}

export const actionsStyles: QuickOrderActionsStyles = {
    wrapper: {
        css: css`
            display: flex;
            justify-content: flex-end;
            clear: both;
            ${({ theme }: { theme: BaseTheme }) =>
                breakpointMediaQueries(theme, [
                    css`
                        flex-flow: column;
                    `,
                    css`
                        flex-flow: column;
                    `,
                    null,
                    null,
                    null,
                ])}
        `,
    },
    overflowMenu: {
        buttonProps: {
            css: css`
                margin-left: 2px;
            `,
        },
    },
    addAllToCartButton: {
        variant: "primary",
        css: css`
            ${({ theme }: { theme: BaseTheme }) =>
                breakpointMediaQueries(theme, [
                    css`
                        margin-top: 10px;
                    `,
                    css`
                        margin-top: 10px;
                    `,
                    css`
                        margin-left: 10px;
                    `,
                    css`
                        margin-left: 10px;
                    `,
                    css`
                        margin-left: 10px;
                    `,
                ])}
        `,
    },
    addToListButton: {
        variant: "tertiary",
        css: css`
            ${({ theme }: { theme: BaseTheme }) =>
                breakpointMediaQueries(theme, [
                    css`
                        margin-top: 10px;
                    `,
                    css`
                        margin-top: 10px;
                    `,
                    css`
                        margin-left: 10px;
                    `,
                    css`
                        margin-left: 10px;
                    `,
                    css`
                        margin-left: 10px;
                    `,
                ])}
        `,
    },
    uploadOrderButton: {
        variant: "secondary",
    },
};

const styles = actionsStyles;

const QuickOrderActions: FC<Props> = ({
    fields,
    productInfos,
    history,
    orderUploadPageLink,
    cartPageLink,
    showAddToCartConfirmationDialog,
    canOrderUpload,
    setAddToListModalIsOpen,
    addCartLines,
    clearProducts,
    loadCurrentCart,
}) => {
    if (!productInfos || productInfos.length === 0) {
        return null;
    }

    const toasterContext = React.useContext(ToasterContext);

    const [allQtysIsValid, setAllQtysIsValid] = useState(false);

    React.useEffect(() => {
        const isValid = productInfos.every(productInfo => {
            return productInfo.qtyOrdered > 0;
        });
        setAllQtysIsValid(isValid);
    }, [productInfos]);

    const uploadOrderClickHandler = () => {
        orderUploadPageLink && history.push(orderUploadPageLink.url);
    };

    const addAllToCartClickHandler = async () => {
        await addCartLines({ productInfos });
        if (showAddToCartConfirmationDialog) {
            toasterContext.addToast({ body: siteMessage("Cart_AllProductsAddedToCart"), messageType: "success" });
        }
        clearProducts();
        cartPageLink && history.push(cartPageLink.url);
        loadCurrentCart({ shouldLoadFullCart: true });
    };

    const addToListClickHandler = () => {
        setAddToListModalIsOpen({ modalIsOpen: true, productInfos });
    };

    const buttons = (
        <>
            {canOrderUpload && (
                <Button {...styles.uploadOrderButton} onClick={uploadOrderClickHandler}>
                    {translate("Upload Order")}
                </Button>
            )}
            <Button {...styles.addToListButton} onClick={addToListClickHandler} disabled={!allQtysIsValid}>
                {translate("Add To List")}
            </Button>
        </>
    );

    return (
        <StyledWrapper {...styles.wrapper}>
            {fields.useOverflowMenu && (
                <>
                    <Hidden below="lg" {...styles.buttonsHidden}>
                        {buttons}
                    </Hidden>
                    <Hidden above="sm" {...styles.buttonsHidden}>
                        {buttons}
                    </Hidden>
                </>
            )}
            {!fields.useOverflowMenu && buttons}
            <Button {...styles.addAllToCartButton} onClick={addAllToCartClickHandler} disabled={!allQtysIsValid}>
                {translate("Add All to Cart & Check Out")}
            </Button>
            {fields.useOverflowMenu && (
                <Hidden below="md" above="md" {...styles.menuHidden}>
                    <OverflowMenu position="end" {...styles.overflowMenu}>
                        {canOrderUpload && (
                            <Clickable onClick={uploadOrderClickHandler}>{translate("Upload Order")}</Clickable>
                        )}
                        <Clickable onClick={addToListClickHandler} disabled={!allQtysIsValid}>
                            {translate("Add To List")}
                        </Clickable>
                    </OverflowMenu>
                </Hidden>
            )}
        </StyledWrapper>
    );
};

const widgetModule: WidgetModule = {
    component: connect(mapStateToProps, mapDispatchToProps)(withHistory(QuickOrderActions)),
    definition: {
        group: "Quick Order",
        allowedContexts: [QuickOrderPageContext],
        displayName: "Actions",
        fieldDefinitions: [
            {
                name: fields.useOverflowMenu,
                displayName: "Use overflow menu on responsive views",
                editorTemplate: "CheckboxField",
                defaultValue: false,
                fieldType: "General",
            },
        ],
    },
};

export default widgetModule;
