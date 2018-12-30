let thisMachine = null;

class StateMachine {

    constructor(machineInfo) {
        this.id = machineInfo.id;
        this.states = {};
        for (let stateName in machineInfo.states) {
            if (!machineInfo.states.hasOwnProperty(stateName)) {
                continue;
            }
            let state = machineInfo.states[stateName];
            let transactions = {};
            if (state.hasOwnProperty('on')) {
                for (let transactionName in state.on) {
                    if (state.on.hasOwnProperty(transactionName)) {
                        let transaction = state.on[transactionName];
                        transactions[transactionName] = new Transaction(transaction.service);
                    }
                }
            }
            let newState = new State(stateName, state.onEntry, state.onExit, transactions);
            if (stateName === machineInfo.initialState) {
                this.currentState = newState;
            }
            this.states[stateName] = newState;

        }
        if (this.currentState === undefined) {
            throw new Error("Initial context is undefined for given machine:" + machineInfo.toSource())
        }
        this.currentContext = new Context(machineInfo.context);
    }

    transition(transactionName, event) {
        this.inMachine(() => {
            let oldState = this.currentState;
            oldState.onExit();
            let transaction = oldState.transactions[transactionName];
            transaction.service(event)
        });
    }

    inMachine(callback) {
        thisMachine = this;
        callback();
        thisMachine = null;
    }

    getContext() {
        return this.currentContext.content;
    }

    setContext(newContext) {
        this.currentContext.addContent(newContext);
    }

    getState() {
        return this.currentState.name;
    }

    setState(newStateName) {
        if (!this.states.hasOwnProperty(newStateName)) {
            throw new Error("Unknown machine state:" + newStateName);
        }
        this.currentState = this.states[newStateName]
    }
}

class State {

    constructor(name, onEntry, onExit, transactions) {
        this.name = name;
        this.onEntryCallback = onEntry;
        this.onExitCallback = onExit;
        this.transactions = transactions;
    }

    onExit() {
        this.onExitCallback();
    }

    onEntry() {
        this.onEntryCallback();
    }

    toString() {
        return "State:" + name;
    }

}

class Transaction {
    constructor(service) {
        this.service = service;
    }
}

class Context {
    constructor(content) {
        this.content = content;
    }

    addContent(newContent) {
        this.content = {...this.content, ...newContent};//merge content
    }
}

class Action {
    constructor(name, funct) {
        this.funct = funct;
        this.name = name;
    }
}

export function machine(description) {
    let m = new StateMachine(description);
    console.log(m);
    return m;

}

export function useContext() {
    if (thisMachine == null) {
        throw new Error("Method useContext() was invoked from outside the instantiated state machine");
    }
    let result = [thisMachine.getContext(), thisMachine.setContext];
    console.log(result);
    return result;
}

export function useState() {
    if (thisMachine == null) {
        throw new Error("Method useState() was invoked from outside the instantiated state machine");
    }
    return [thisMachine.getState(), thisMachine.setState];
}
