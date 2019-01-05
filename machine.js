let thisMachine = null;
let thisEvent = null;

class StateMachine {

    constructor(machineInfo) {
        this.machineInfo = machineInfo;
        this.currentStateName = machineInfo.initialState;
    }

    recursiveInvoke(event, actionObject /* string, function or array of actionObject*/) {
        if (Array.isArray(actionObject)) {
            for (let i = 0; i < actionObject.length; i++) {
                this.recursiveInvoke(event, actionObject[i]);
            }
        } else if (typeof actionObject === 'string') {
            let actions = this.machineInfo.actions;
            if (typeof (actions) === 'undefined'
                || !actions.hasOwnProperty(actionObject)) {
                throw new Error("Can't find such action: " + actionObject);
            }
            this.recursiveInvoke(event, actions[actionObject]);
        } else if (typeof actionObject === 'function') {
            this.inThisMachine(() => {
                this.withEvent(() => {
                    actionObject(event);
                }, event);
            });
        }
    }

    transition(transitionName, event) {
        let transition = this.machineInfo.states[this.currentStateName].on[transitionName];
        if (transition.hasOwnProperty('service')) {
            this.recursiveInvoke(event, transition.service);
        } else if (transition.hasOwnProperty('target')) {
            this.recursiveInvoke(event, () => {
                const [st, setState] = useState();
                setState(transition.target);
            });
        } else {
            throw new Error("Transition without service or target: '" + transitionName);
        }
    }

    inThisMachine(callback) {
        thisMachine = this;
        callback();
        thisMachine = null;
    }

    withEvent(callback, event) {
        thisEvent = event;
        callback();
        thisEvent = null;
    }
}

export function machine(description) {
    return new StateMachine(description);
}

export function useContext() {
    let innerMachine = thisMachine;
    if (innerMachine == null) {
        throw new Error("Method useContext() was invoked from outside the instantiated state machine");
    }
    let setContext = function (newContext) {
        innerMachine.machineInfo.context = {...innerMachine.machineInfo.context, ...newContext}; //merge content
    };
    return [innerMachine.machineInfo.context, setContext];
}

export function useState() {
    let innerMachine = thisMachine;
    let innerEvent = thisEvent;
    if (innerMachine == null || thisEvent == null) {
        throw new Error("Method useState() was invoked from outside the instantiated state machine");
    }

    let setState = function (newStateName) {
        let onExit = innerMachine.machineInfo.states[innerMachine.currentStateName].onExit;
        innerMachine.recursiveInvoke(innerEvent, onExit);
        innerMachine.currentStateName = newStateName; // set new state
        let onEntry = innerMachine.machineInfo.states[innerMachine.currentStateName].onEntry;
        innerMachine.recursiveInvoke(innerEvent, onEntry);

    };
    return [innerMachine.currentStateName, setState];
}

export function assert(check, msg) {
    if (check) return;
    throw new Error(msg || "Assertion failed!");
}
