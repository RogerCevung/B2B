import { updateContext } from "@insite/client-framework/Context";
import { createHandlerChainRunner, Handler, makeHandlerChainAwaitable } from "@insite/client-framework/HandlerCreator";
import { GetShipTosApiParameter } from "@insite/client-framework/Services/CustomersService";
import { Session, updateSession } from "@insite/client-framework/Services/SessionService";
import { getBillToState } from "@insite/client-framework/Store/Data/BillTos/BillTosSelectors";
import loadBillTo from "@insite/client-framework/Store/Data/BillTos/Handlers/LoadBillTo";
import updateBillToChain from "@insite/client-framework/Store/Data/BillTos/Handlers/UpdateBillTo";
import loadCart from "@insite/client-framework/Store/Data/Carts/Handlers/LoadCart";
import loadCurrentCart from "@insite/client-framework/Store/Data/Carts/Handlers/LoadCurrentCart";
import loadShipTos from "@insite/client-framework/Store/Data/ShipTos/Handlers/LoadShipTos";
import { getShipTosDataView } from "@insite/client-framework/Store/Data/ShipTos/ShipTosSelectors";
import { BillToModel, ShipToModel } from "@insite/client-framework/Types/ApiModels";

type HandlerType = Handler<
    {
        billTo: BillToModel;
    },
    {
        shipTos: ShipToModel[];
        defaultShipTo: ShipToModel;
    }
>;

export const UpdateBillTo: HandlerType = async props => {
    const awaitableUpdateBillTo = makeHandlerChainAwaitable(updateBillToChain);
    await awaitableUpdateBillTo({
        billTo: props.parameter.billTo,
    })(props.dispatch, props.getState);

    // reload to make sure we get validation
    await makeHandlerChainAwaitable(loadBillTo)({
        billToId: props.parameter.billTo.id,
    })(props.dispatch, props.getState);
};

export const LoadShipTos: HandlerType = async props => {
    const loadShipTosParameter: GetShipTosApiParameter = {
        billToId: props.parameter.billTo.id,
        expand: ["validation"],
        exclude: ["createNew", "oneTime", "showAll"],
    };

    const getShipTos = () => getShipTosDataView(props.getState(), loadShipTosParameter).value;
    let shipTos = getShipTos();
    if (!shipTos) {
        const awaitableLoadShipTos = makeHandlerChainAwaitable(loadShipTos);
        await awaitableLoadShipTos(loadShipTosParameter)(props.dispatch, props.getState);
        shipTos = getShipTos();
    }

    if (!shipTos?.length) {
        throw new Error("Could not find any shiptos for the selected billto.");
    }

    props.shipTos = shipTos;
};

export const GetDefaultShipTo: HandlerType = props => {
    let defaultShipTo = props.shipTos.find(s => s.isDefault);
    if (!defaultShipTo) {
        defaultShipTo = props.shipTos.find(s => s.id === props.parameter.billTo.id);
        if (!defaultShipTo) {
            defaultShipTo = props.shipTos.filter(s => s.id !== props.parameter.billTo.id)[0];
        }
    }

    if (!defaultShipTo) {
        throw new Error("Could not find any shiptos for the selected billto.");
    }

    props.defaultShipTo = defaultShipTo;
};

export const UpdateContext: HandlerType = props => {
    updateContext({
        billToId: props.parameter.billTo.id,
        shipToId: props.defaultShipTo.id,
    });
};

export const UpdateSession: HandlerType = async props => {
    await updateSession({
        session: {
            billToId: props.parameter.billTo.id,
            shipToId: props.defaultShipTo.id,
            customerWasUpdated: true,
        } as Session,
    });
};

export const LoadCart: HandlerType = props => {
    const state = props.getState();
    const { cartId } = state.pages.checkoutShipping;
    if (cartId) {
        props.dispatch(loadCart({ cartId }));
    } else {
        props.dispatch(loadCurrentCart());
    }
};

export const DispatchCompleteUpdateBillTo: HandlerType = props => {
    const billToState = getBillToState(props.getState(), props.parameter.billTo.id);

    props.dispatch({
        type: "Pages/CheckoutShipping/CompleteUpdateBillTo",
        billTo: billToState.value!,
    });
};

export const DispatchCompleteUpdateShipTo: HandlerType = props => {
    props.dispatch({
        type: "Pages/CheckoutShipping/CompleteUpdateShipTo",
        shipTo: props.defaultShipTo,
    });
};

const chain = [
    UpdateBillTo,
    LoadShipTos,
    GetDefaultShipTo,
    UpdateContext,
    UpdateSession,
    LoadCart,
    DispatchCompleteUpdateBillTo,
    DispatchCompleteUpdateShipTo,
];

const updateBillTo = createHandlerChainRunner(chain, "UpdateBillTo");
export default updateBillTo;
