let thisMachine = null;

class StateMachine {

    constructor(machineInfo) {
        this.id = machineInfo.id;
        this.states = {};
        this.context = {...machineInfo.context};
        for (let stateName in machineInfo.states) {
            if (!machineInfo.states.hasOwnProperty(stateName)) {
                continue;
            }
            let state = machineInfo.states[stateName];
            let transitions = {};
            if (state.hasOwnProperty('on')) {
                for (let transitionsName in state.on) {
                    if (state.on.hasOwnProperty(transitionsName)) {
                        let transitionAction;
                        if (state.on[transitionsName].hasOwnProperty('service')) {
                            transitionAction = state.on[transitionsName].service;
                        } else if (state.on[transitionsName].hasOwnProperty('target')) {
                            transitionAction = () => {
                                const [st, setState] = useState();
                                setState(state.on[transitionsName].target);
                            }
                        } else {
                            throw new Error("A transition has no service or target property.")
                        }
                        transitions[transitionsName] = new Action(this, transitionAction);
                    }
                }
            }
            let onEntryAction = new Action(this, state.onEntry);
            let onExitAction = new Action(this, state.onExit);
            let newState = new State(stateName, onEntryAction, onExitAction, transitions);

            if (stateName === machineInfo.initialState) {
                this.currentState = newState;
            }
            this.states[stateName] = newState;
            this.actionFunctions = machineInfo.actions;
        }

        if (typeof this.currentState === 'undefined') {
            throw new Error("Initial state is undefined for given machine:" + machineInfo.toSource())
        }
    }

    transition(transitionName, event) {
        if (this.currentState.transitions.hasOwnProperty(transitionName)) {
            this.currentState.transitions[transitionName].invoke(event);
        }
        else {
            throw new Error("Unknown transition: " + transitionName);
        }
    }

    inThisMachine(callback) {
        thisMachine = this;
        callback();
        thisMachine = null;
    }

}

class State {

    constructor(name, onEntryAction, onExitAction, transitions) {
        this.name = name;
        this.onEntryAction = onEntryAction;
        this.onExitAction = onExitAction;
        this.transitions = transitions;
    }
}

class Action {
    constructor(stateMachine, actionObject) {
        this.actionObject = actionObject; // string, function or array of actionObject
        this.stateMachine = stateMachine;
    }

    invoke(event) {
        this.recursiveInvoke(event, this.actionObject);
    }

    recursiveInvoke(event, actionObject) {
        if (typeof actionObject === 'undefined') {
            // do nothing, empty action
        } else if (Array.isArray(actionObject)) {
            for (let i = 0; i < actionObject.length; i++) {
                this.recursiveInvoke(event, actionObject[i]);
            }
        } else if (typeof actionObject === 'string') {
            if (typeof (this.stateMachine.actionFunctions) === 'undefined'
                || !this.stateMachine.actionFunctions.hasOwnProperty(actionObject)) {
                throw new Error("Can't find such action: [" + actionObject + "] in state machine: " + this.stateMachine.actionFunctions.toSource());
            }
            this.recursiveInvoke(event, this.stateMachine.actionFunctions[actionObject]);
        } else if (typeof actionObject === 'function') {
            this.stateMachine.inThisMachine(() => {
                actionObject(event);
            });
        } else {
            throw new Error("An action can be a string, function or an array of actions only, but was:" + actionObject.toSource());
        }
    }
}

export function machine(description) {
    return new StateMachine(description);

}

export function useContext() {
    let innerMachine = thisMachine;
    if (innerMachine == null) {
        throw new Error("Method useState() was invoked from outside the instantiated state machine");
    }
    let setContext = function (newContext) {
        innerMachine.context = {...innerMachine.context, ...newContext}; //merge content
    };
    return [innerMachine.context, setContext];
}

export function useState() {
    let innerMachine = thisMachine;
    if (innerMachine == null) {
        throw new Error("Method useState() was invoked from outside the instantiated state machine");
    }

    let setState = function (newStateName) {
        innerMachine.currentState.onExitAction.invoke(); // old state onExit
        if (!innerMachine.states.hasOwnProperty(newStateName)) {
            throw new Error("Unknown machine state:" + newStateName);
        }
        innerMachine.currentState = innerMachine.states[newStateName]; // set new state
        try {
            innerMachine.currentState.onEntryAction.invoke(); // new state onEntry
        } catch (e) {
            console.log(e);
        }
    };
    return [innerMachine.currentState.name, setState];
}

export function assert(check, msg) {
    if (check) return;
    throw new Error(msg || "Assertion failed!");
}
