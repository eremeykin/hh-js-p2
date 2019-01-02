import {machine, useContext, useState, assert} from './machine.js'

let log = [];

let machineInfo = {
    id: 'vacancy',
    initialState: 'notResponded',
    context: {id: 123},
    states: {
        responded: {
            onEntry: 'logEntryAction',
            onExit: 'logExitAction',
            on: {
                UNRESPOND: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        setContext({test: 5345});
                    }
                }
            }
        },
        notResponded: {
            onEntry: 'logEntryAction',
            onExit: 'logExitAction',
            on: {
                RESPOND: {
                    service: (event) => {
                        const [state, setState] = useState();
                        setState('responded');
                        setTimeout(() => {
                            try {
                                const [context, setContext] = useContext();
                                log.push(context.toSource());
                                setContext({completed: true});
                            } catch (e) {
                                log.push(e.toString());
                            }
                        }, 500);
                    }
                }
            }
        },
    },
    actions: {
        logEntryAction: (event) => {
            const [state] = useState();
            log.push('entry: ' + state);
        },
        logExitAction: (event) => {
            const [state] = useState();
            log.push('exit: ' + state);
        }
    }
};

const vacancyMachine = machine(machineInfo);

vacancyMachine.transition('RESPOND', {resume: {name: 'Vasya', lastName: 'Pupkin'}});
vacancyMachine.transition('UNRESPOND', {resume: {name: 'Vasya', lastName: 'Pupkin'}});


setTimeout(check, 1000);

function check() {
    assert(log[2] === "Error: Method useContext() was invoked from outside the instantiated state machine");
    console.log('useContext() inside an async callback throws an error, it is ok');
}
