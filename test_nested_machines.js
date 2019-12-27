import {machine, useContext, useState, assert} from './machine.js'

let log = [];

let firstInfo = {
    id: 'first',
    initialState: 'notResponded',
    context: {id: 100},
    states: {
        responded: {
            onEntry: 'onStateEntry',
            onExit: 'onStateExit',
            on: {
                UNRESPOND: {
                    service: (event) => {
                        const [state, setState] = useState();
                        const [context, setContext] = useContext();
                        log.push(context.id + ' UNRESPOND transaction from ' + state);
                        setState('notResponded');
                    }
                }
            }
        },
        notResponded: {
            onEntry: 'onStateEntry',
            onExit: 'onStateExit',
            on: {
                RESPOND: {
                    service: (event) => {
                        const [state, setState] = useState();
                        const [context, setContext] = useContext();
                        log.push(context.id + ' RESPOND transaction from ' + state);
                        setTimeout(() => {
                            setState('responded');
                        }, 1000);
                    }
                }
            }
        },
    },
    actions: {
        onStateEntry: (event) => {
            const [state] = useState();
            const [context, setContext] = useContext();
            log.push(context.id + ' entry to state ' + state);
        },
        onStateExit: (event) => {
            const [state] = useState();
            const [context, setContext] = useContext();
            log.push(context.id + ' exit state ' + state);
        }
    }
};

let secondInfo = {
    id: 'second',
    initialState: 'notResponded',
    context: {id: 200},
    states: {
        responded: {
            onEntry: 'onStateEntry',
            onExit: 'onStateExit',
            on: {
                UNRESPOND: {
                    service: (event) => {
                        const [state, setState] = useState();
                        const [context, setContext] = useContext();
                        log.push(context.id + ' UNRESPOND transaction from ' + state);
                        setState('notResponded');
                    }
                }
            }
        },
        notResponded: {
            onEntry: 'onStateEntry',
            onExit: 'onStateExit',
            on: {
                RESPOND: {
                    service: (event) => {
                        firstMachine.transition('RESPOND', {resume: {name: 'Vasya', lastName: 'Pupkin'}});
                        const [state, setState] = useState();
                        const [context, setContext] = useContext();
                        log.push(context.id + ' RESPOND transaction from ' + state);
                        setState('responded');

                    }
                }
            }
        },
    },
    actions: {
        onStateEntry: (event) => {
            const [state] = useState();
            const [context, setContext] = useContext();
            log.push(context.id + ' entry to state ' + state);
        },
        onStateExit: (event) => {
            const [state] = useState();
            const [context, setContext] = useContext();
            log.push(context.id + ' exit state ' + state);
        }
    }
};


assert(firstInfo.context.id === 100);
assert(secondInfo.context.id === 200);

let firstMachine = machine(firstInfo);
let secondMachine = machine(secondInfo);



secondMachine.transition('RESPOND', {resume: {name: 'Vasya', lastName: 'Pupkin'}});

setTimeout(check1, 2500);

function check1() {
    assert(log[0] === "100 RESPOND transaction from notResponded");
    assert(log[1] === "200 RESPOND transaction from notResponded");
    assert(log[2] === "200 exit state notResponded");
    assert(log[3] === "200 entry to state responded");
    assert(log[4] === "100 exit state notResponded");
    assert(log[5] === "100 entry to state responded");

    console.log("two nested machines test ok");
}
