class StateMachine {

    constructor(machineInfo) {
        this.id = machineInfo.id;
        this.states = [];
        for (let state in machineInfo.states) {
            if (!machineInfo.states.hasOwnProperty(state)) {
                continue;
            }
            let transactions = [];
            if (machineInfo.states.hasOwnProperty('on')) {
                for (let transaction of machineInfo.states.on) {
                    transactions.push(new Transaction(transaction, transaction.service));
                }
            }
            let newState = new State(state, state.onEntry, state.onExit, transactions);
            if (state === machineInfo.initialState) {
                this.currentState = newState;
            }
            this.states.push(newState);

        }
        if (this.currentState === undefined) {
            throw new Error("Initial context is undefined for given machine:" + machineInfo.toSource())
        }
        this.currentContext = new Context(machineInfo.context);
    }
}

class State {

    constructor(name, onEntry, onExit, transactions) {
        this.name = name;
        this.onEntry = onEntry;
        this.onExit = onExit;
        this.transactions = transactions;
    }

    toString() {
        return "State:" + name;
    }

}

class Transaction {
    constructor(name, service) {
        this.name = name;
        this.service = service;
    }

    toString() {
        return "Transaction: " + name;
    }
}

class Context {
    constructor(content) {
        this.content = content;
    }
}

export function machine(description) {
    let m = new StateMachine(description);
    console.log(m);
    return m;
}

export function useContext() {

}

export function useState() {

}