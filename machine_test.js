import {machine, useContext, useState} from './machine.js'

let machineInfo = { // machine — создает инстанс state machine (фабрика)
    id: 'vacancy', // У каждого может быть свой id
    initialState: 'notResponded', // начальное состояние
    context: {id: 123}, // дополнительный контекст (payload)
    states: { // Граф состояний и переходов между ними
        responded: {// Каждое поле — это возможное состоение
            onEntry: 'onStateEntry' // action, который нужно выполнить при входе в это состояние. Можно задавать массивом, строкой или функцией
        },
        notResponded: {
            onExit() {// action, который нужно выполнить при выходе из этого состояния. Можно задавать массивом, строкой или функцией
                console.log('we are leaving notResponded state');
            },
            on: { // Блок описания транзакций
                RESPOND: { // Транзакция
                    service: (event) => {
                        // упрощенный сервис, вызываем при транзакции
                        const [context, setContext] = useContext(); // Позволяет получить текущий контекст и изменить его
                        const [state, setState] = useState(); // Позволяет получить текущий стейт и изменить его
                        // Поддерживаются асинхронные действия
                        window.fetch('http://localhost:8080/test/resume', {
                            method: 'post',
                            headers: {
                                'Accept': 'application/json, text/plain, */*',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({resume: event.resume, vacancyId: context.id})
                        }).then(() => {
                            setState('responded'); // меняем состояние
                            setContext({completed: true}); // Мержим контекст {id: 123, comleted: true}
                        });
                    }
                    // Если не задан сервис, то просто переводим в заданный target, иначе выполняем сервис.
                    // target: 'responded',
                }
            }
        },
    },
    actions: { // Раздел описание экшенов
        onStateEntry: (event) => {
            const [state] = useState();
            console.log('now state is ' + state);
        },
        makeResponse: (event) => {
            // both sync and async actions
            const [contex, setContext] = useContext();
            window.fetch({method: 'post', data: {resume: event.resume, vacancyId: context.id}})
        }
    }
};

const vacancyMachine = machine(machineInfo);
vacancyMachine.transition('RESPOND', {resume: {name: 'Vasya', lastName: 'Pupkin'}});


