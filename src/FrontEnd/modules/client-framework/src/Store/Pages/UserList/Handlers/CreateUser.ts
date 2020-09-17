import {
    ApiHandlerDiscreteParameter,
    createHandlerChainRunner,
    HasOnError,
    HasOnSuccess,
} from "@insite/client-framework/HandlerCreator";
import { addAccount, AddAccountApiParameter } from "@insite/client-framework/Services/AccountService";
import { ServiceResult } from "@insite/client-framework/Services/ApiService";
import { getSettingsCollection } from "@insite/client-framework/Store/Context/ContextSelectors";
import sendActivationEmail from "@insite/client-framework/Store/Pages/UserSetup/Handlers/SendActivationEmail";
import { AccountModel } from "@insite/client-framework/Types/ApiModels";

type HandlerType = ApiHandlerDiscreteParameter<
    {
        userName: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        approver: string;
    } & HasOnSuccess &
        HasOnError<string>,
    AddAccountApiParameter,
    ServiceResult<AccountModel>
>;

export const PopulateApiParameter: HandlerType = props => {
    props.apiParameter = {
        account: {
            ...props.parameter,
            requiresActivation: true,
        },
    };

    const useEmailAsUserName = getSettingsCollection(props.getState()).accountSettings.useEmailAsUserName;
    if (useEmailAsUserName) {
        props.apiParameter.account.userName = props.apiParameter.account.email;
    }
};

export const CallAddAccount: HandlerType = async props => {
    props.apiResult = await addAccount(props.apiParameter);
    if (!props.apiResult.successful) {
        props.parameter.onError?.(props.apiResult.errorMessage);
        return false;
    }
};

export const SendActivationEmail: HandlerType = props => {
    if (props.apiResult.successful) {
        sendActivationEmail({ userName: props.apiResult.result.userName })(props.dispatch, props.getState);
    }
};

export const DispatchResetAccounts: HandlerType = props => {
    props.dispatch({
        type: "Data/Accounts/Reset",
    });
};

export const ExecuteOnSuccessCallback: HandlerType = props => {
    props.parameter.onSuccess?.();
};

export const chain = [
    PopulateApiParameter,
    CallAddAccount,
    SendActivationEmail,
    DispatchResetAccounts,
    ExecuteOnSuccessCallback,
];

const createUser = createHandlerChainRunner(chain, "CreateUser");

export default createUser;
