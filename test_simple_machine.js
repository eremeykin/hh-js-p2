import {machine, useContext, useState, assert} from './machine.js'

let log = [];

let machineInfo = {
    id: 'vacancy',
    initialState: 'notResponded',
    context: {id: 123},
    states: {
        responded: {
            onEntry: 'onStateEntry'
        },
        notResponded: {
            onExit() {
                log.push('we are leaving notResponded state');
            },
            on: {
                RESPOND: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        const [state, setState] = useState();
                        window.fetch('http://localhost:8080/test/resume', {
                            method: 'post',
                            headers: {
                                'Accept': 'application/json, text/plain, */*',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({resume: event.resume, vacancyId: context.id})
                        }).then(() => {
                            setState('responded');
                            setContext({completed: true});
                        });
                    }
                }
            }
        },
    },
    actions: {
        onStateEntry: (event) => {
            const [state] = useState();
            log.push('now state is ' + state);
        },
    }
};

const vacancyMachine = machine(machineInfo);
vacancyMachine.transition('RESPOND', {resume: {name: 'Vasya', lastName: 'Pupkin'}});

setTimeout(check, 500);

function check() {
    assert(vacancyMachine.context.id ===  123);
    assert(vacancyMachine.context.completed);
    assert(log[0] === "we are leaving notResponded state");
    assert(log[1] === "now state is responded");
    assert(vacancyMachine.currentState.name === "responded");
    console.log("simple test ok");
}
