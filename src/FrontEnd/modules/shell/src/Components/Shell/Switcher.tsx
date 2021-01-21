import { DeviceType } from "@insite/client-framework/Types/ContentItemModel";
import Icon from "@insite/mobius/Icon";
import Edit2 from "@insite/mobius/Icons/Edit2";
import Eye from "@insite/mobius/Icons/Eye";
import ContentModeClicker from "@insite/shell/Components/Shell/ContentModeClicker";
import { Spacer } from "@insite/shell/Components/Shell/HeaderBar";
import HeaderGear from "@insite/shell/Components/Shell/HeaderGear";
import ViewPortClicker from "@insite/shell/Components/Shell/ViewPortClicker";
import { changeStageMode } from "@insite/shell/Store/ShellContext/ShellContextActionCreators";
import ShellState from "@insite/shell/Store/ShellState";
import * as React from "react";
import { connect, ResolveThunks } from "react-redux";
import styled from "styled-components";

const mapStateToProps = ({ shellContext: { mobileCmsModeActive, stageMode } }: ShellState) => ({
    mobileCmsModeActive,
    stageMode,
});

const mapDispatchToProps = {
    changeStageMode,
};

type Props = { disabled?: boolean } & ReturnType<typeof mapStateToProps> & ResolveThunks<typeof mapDispatchToProps>;

const Switcher: React.FC<Props> = ({ disabled, mobileCmsModeActive, stageMode, changeStageMode }) => {
    const clicker = (targetStageMode: DeviceType) => (
        <ViewPortClicker
            targetStageMode={targetStageMode}
            disabled={disabled}
            currentStageMode={stageMode}
            changeStageMode={changeStageMode}
        />
    );

    return (
        <SwitcherStyle>
            {mobileCmsModeActive && (
                <>
                    <StyledA
                        target="_blank"
                        href="https://support.insitesoft.com/hc/en-us/articles/360038606591-Use-the-Mobile-App-CMS"
                    >
                        How To Preview Changes
                    </StyledA>
                    <Icon src={Spacer} color="#999" />
                </>
            )}
            <div>
                <ContentModeClicker targetContentMode="Editing" icon={Edit2} disabled={disabled} />
                <ContentModeClicker targetContentMode="Previewing" icon={Eye} disabled={disabled} />
            </div>
            {!mobileCmsModeActive && (
                <>
                    <Icon src={Spacer} color="#999" />
                    <div data-test-selector="preview_switcher">
                        {clicker("Phone")}
                        {clicker("Tablet")}
                        {clicker("Desktop")}
                    </div>
                </>
            )}
            <Icon src={Spacer} color="#999" />
            <HeaderGear />
        </SwitcherStyle>
    );
};

const SwitcherStyle = styled.div`
    margin-left: 5px;
    display: flex;
    align-items: center;
    margin-right: 30px;
`;

const StyledA = styled.a`
    color: #09f;
    font-family: ${({ theme }) => theme.typography.body.fontFamily};
    font-size: ${({ theme }) => theme.modal.defaultProps.headlineTypographyProps.size};
`;

export default connect(mapStateToProps, mapDispatchToProps)(Switcher);
