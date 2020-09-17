import { SafeDictionary } from "@insite/client-framework/Common/Types";
import { removeWidget, replaceItem, updateField } from "@insite/client-framework/Store/Data/Pages/PagesActionCreators";
import FieldDefinition from "@insite/client-framework/Types/FieldDefinition";
import PageProps, { ItemProps } from "@insite/client-framework/Types/PageProps";
import WidgetProps from "@insite/client-framework/Types/WidgetProps";
import Scrim from "@insite/mobius/Overlay/Scrim";
import FieldsEditor from "@insite/shell/Components/ItemEditor/FieldsEditor";
import SideBarForm from "@insite/shell/Components/Shell/SideBarForm";
import { sendToSite } from "@insite/shell/Components/Shell/SiteHole";
import {
    getPageDefinition,
    getWidgetDefinition,
    LoadedPageDefinition,
    LoadedWidgetDefinition,
} from "@insite/shell/DefinitionLoader";
import { getPageState } from "@insite/shell/Services/ContentAdminService";
import { cancelEditingItem, doneEditingItem } from "@insite/shell/Store/PageEditor/PageEditorActionCreators";
import { getCurrentPageForShell } from "@insite/shell/Store/ShellSelectors";
import ShellState from "@insite/shell/Store/ShellState";
import { cloneDeep } from "lodash";
import * as React from "react";
import { connect, ResolveThunks } from "react-redux";
import styled from "styled-components";

interface OwnProps {}

const mapStateToProps = (state: ShellState, ownProps: OwnProps) => {
    let item: PageProps | WidgetProps | undefined;
    let definition: LoadedPageDefinition | LoadedWidgetDefinition | undefined;
    if (state.pageEditor.editingId) {
        const currentPage = getCurrentPageForShell(state);
        if (state.pageEditor.editingId === currentPage.id) {
            item = currentPage;
            definition = cloneDeep(getPageDefinition(currentPage.type));
        } else {
            item = state.data.pages.widgetsById[state.pageEditor.editingId];
            definition = getWidgetDefinition(item.type);
        }
    }

    return {
        item,
        definition,
        itemBeforeEditing: state.pageEditor.itemBeforeEditing,
        language: state.shellContext.languagesById[state.shellContext.currentLanguageId]!,
        defaultLanguageId: state.shellContext.defaultLanguageId,
        personaId: state.shellContext.currentPersonaId,
        defaultPersonaId: state.shellContext.defaultPersonaId,
        deviceType: state.shellContext.currentDeviceType,
        removeItemIfCanceled: state.pageEditor.removeItemIfCanceled,
        isVariant: !!state.pageEditor.isEditingVariant,
        treeNodesByParentId: state.pageTree.treeNodesByParentId,
        headerTreeNodesByParentId: state.pageTree.headerTreeNodesByParentId,
        footerTreeNodesByParentId: state.pageTree.footerTreeNodesByParentId,
    };
};

const mapDispatchToProps = {
    updateField,
    doneEditingItem,
    cancelEditingItem,
    replaceItem,
    removeWidget,
};

type Props = ReturnType<typeof mapStateToProps> & ResolveThunks<typeof mapDispatchToProps> & OwnProps;

interface State {
    hasValidationErrors: boolean;
}

class ItemEditor extends React.Component<Props, State> {
    private hasValidationErrors: () => boolean;

    constructor(props: Props) {
        super(props);

        this.hasValidationErrors = () => false;
        this.state = {
            hasValidationErrors: false,
        };
    }

    updateField = (fieldName: string, value: any) => {
        const { item, definition, language, defaultLanguageId, personaId, defaultPersonaId, deviceType } = this.props;
        if (!item || !definition || !definition.fieldDefinitions) {
            return;
        }

        const fieldDefinition = definition.fieldDefinitions.filter(o => o.name === fieldName)[0];

        const parameter = {
            id: item.id,
            fieldName,
            value,
            fieldType: fieldDefinition.fieldType,
            language,
            defaultLanguageId,
            personaId,
            defaultPersonaId,
            deviceType,
        };
        sendToSite({
            type: "UpdateField",
            ...parameter,
        });
        this.props.updateField(parameter);
    };

    doneEditingItem = () => {
        if (!this.hasValidationErrors()) {
            this.props.doneEditingItem();
        }
    };

    cancelEditingItem = () => {
        const { itemBeforeEditing, cancelEditingItem, removeItemIfCanceled, removeWidget, replaceItem } = this.props;
        cancelEditingItem();
        if (removeItemIfCanceled) {
            removeWidget(itemBeforeEditing!.id);
            sendToSite({
                type: "RemoveWidget",
                id: itemBeforeEditing!.id,
            });
        } else {
            replaceItem(itemBeforeEditing!);
            sendToSite({
                type: "ReplaceItem",
                item: itemBeforeEditing!,
            });
        }
    };

    updateHasValidationErrors = (hasValidationErrors: boolean) => {
        this.setState({
            hasValidationErrors,
        });
    };

    registerHasValidationErrors = (validate: () => boolean) => {
        this.hasValidationErrors = validate;
    };

    render() {
        const {
            item,
            definition,
            isVariant,
            treeNodesByParentId,
            headerTreeNodesByParentId,
            footerTreeNodesByParentId,
        } = this.props;

        if (!item || !definition) {
            return null;
        }

        const fieldDefinitions = definition.fieldDefinitions ?? [];

        if (item.type === "VariantRootPage") {
            const currentPageState = getPageState(
                item.id,
                treeNodesByParentId[item.parentId],
                headerTreeNodesByParentId[item.parentId],
                footerTreeNodesByParentId[item.parentId],
            );

            if (currentPageState) {
                const childList =
                    treeNodesByParentId[currentPageState.nodeId] ||
                    headerTreeNodesByParentId[currentPageState.nodeId] ||
                    footerTreeNodesByParentId[currentPageState.nodeId];

                let variantDefinition: LoadedPageDefinition | undefined;
                for (const child of childList) {
                    if (!child.isVariant) {
                        continue;
                    }
                    variantDefinition = getPageDefinition(child.type);
                    break;
                }

                if (variantDefinition) {
                    const variantFieldDefinitions: SafeDictionary<FieldDefinition> = {};

                    (variantDefinition.fieldDefinitions ?? []).forEach(o => {
                        variantFieldDefinitions[o.name] = o;
                    });

                    const rootFieldDefinitions: SafeDictionary<FieldDefinition> = {};

                    fieldDefinitions.forEach(o => {
                        rootFieldDefinitions[o.name] = o;
                    });

                    for (let i = fieldDefinitions.length - 1; i >= 0; i--) {
                        if (!variantFieldDefinitions[fieldDefinitions[i].name]) {
                            fieldDefinitions.splice(i, 1);
                        }
                    }

                    if (variantFieldDefinitions["urlSegment"] && !rootFieldDefinitions["urlSegment"]) {
                        fieldDefinitions.unshift(variantFieldDefinitions["urlSegment"]);
                    }

                    if (variantFieldDefinitions["title"] && !rootFieldDefinitions["title"]) {
                        fieldDefinitions.unshift(variantFieldDefinitions["title"]);
                    }
                }
            }
        } else if (isVariant) {
            const rootFields = [
                "title",
                "urlSegment",
                "metaKeywords",
                "metaDescription",
                "hideFromSearchEngines",
                "hideFromSiteSearch",
                "excludeFromNavigation",
                "excludeFromSignInRequired",
            ];
            for (let i = fieldDefinitions.length - 1; i >= 0; --i) {
                for (let j = 0; j < rootFields.length; ++j) {
                    if (fieldDefinitions[i].name === rootFields[j]) {
                        fieldDefinitions.splice(i, 1);
                        break;
                    }
                }
            }
        }

        if (!isVariant) {
            for (let i = 0; i < fieldDefinitions.length; ++i) {
                if (fieldDefinitions[i].name === "variantName") {
                    fieldDefinitions.splice(i, 1);
                    break;
                }
            }
        }

        return (
            <>
                <Scrim zIndexLevel="modal" />
                <SideBarForm
                    title={`Edit ${definition.displayName}`}
                    save={this.doneEditingItem}
                    name="EditItem"
                    cancel={this.cancelEditingItem}
                    disableSave={this.state.hasValidationErrors}
                >
                    <FieldsEditor
                        fieldDefinitions={fieldDefinitions}
                        item={item}
                        updateField={this.updateField}
                        registerHasValidationErrors={this.registerHasValidationErrors}
                        updateHasValidationErrors={this.updateHasValidationErrors}
                    />
                </SideBarForm>
            </>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ItemEditor);

export interface ContentItemFieldProps<TFieldValue, TFieldDefinition extends FieldDefinition> {
    fieldDefinition: TFieldDefinition;
    item: ItemProps;
    fieldValue: TFieldValue;
    updateField: (fieldName: string, value: TFieldValue) => void;
}

type ContentItemFieldComponent = React.ComponentType<ContentItemFieldProps<any, FieldDefinition>>;

const ErrorMessage = styled.span`
    color: red;
`;

const TabsStyle = styled.ul`
    border: 1px solid #ccc;
    display: flex;
    border-radius: 3px;
    height: 35px;
    align-items: center;

    li {
        background: linear-gradient(180deg, #fff 0%, #eaeaea 100%);
        flex-grow: 1;
        text-align: center;
        border-left: 1px solid #ccc;
        font-size: 18px;
        line-height: 21px;
        font-weight: 300;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    li:first-child {
        border-left: none;
    }
`;
