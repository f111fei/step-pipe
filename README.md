# step-pipe

A simple control-flow library that makes parallel execution, serial execution, and error handling painless. Support `Promise`, `async/await`.

## Install

    npm install --save step-pipe

## Usage

    import { Step, PipeContext } from '../out';

    // simple
    function step1() {
        return (context: PipeContext<string>) => {
            console.log('step start');
            context.next('I am step 1 result');
        };
    }

    // delay callback
    function step2() {
        return (context: PipeContext<string>) => {
            console.log(context.content);
            setTimeout(() => {
                context.next('I am step 2 result');
            }, 300);
        };
    }

    // with options
    function step3(options?: { result?: string }) {
        if (!options) {
            options = {}
        };
        if (!options.result) {
            options.result = '';
        }

        return (context: PipeContext<string>) => {
            console.log(context.content);
            setTimeout(() => {
                context.next(options.result);
            }, 300);
        };
    }

    // use async/await
    function step4() {
        return async (context: PipeContext<string>) => {
            console.log(context.content);
            const date = await Promise.resolve(new Date());
            await context.next('I am step 4 result:' + date.toLocaleDateString());
        };
    }

    function step5() {
        return async (context: PipeContext<string>) => {
            console.log(context.content);

            const createPromises = () => {
                const promises: Promise<string>[] = [];
                for (let i = 0; i < 10; i++) {
                    promises.push(new Promise((c , e) => {
                        setTimeout(() => {
                            c(i + '');
                        }, Math.random() * 5000);
                    }));
                }
                return promises;
            }

            const promises1 = createPromises();

            // parallel execution
            const p = promises1.map(async promise => {
                const result = await promise; 
                await context.next('parallel step:' + result);
            });

            await Promise.all(p);

            const promises2 = createPromises();

            // serial execution
            for (let i = 0; i < promises2.length; i++) {
                const result = await promises2[i];
                await context.next('serial step:' + result);
            }
        };
    }

    function end() {
        return async (context: PipeContext<string>) => {
            console.log(context.content);
        }
    }

    const step = new Step();

    step.pipe(step1())
        .pipe(step2())
        .pipe(step3({ result: 'I am step 3 result' }))
        .pipe(step4())
        .pipe(step5())
        .pipe(end());

    step.catch(error => {
        console.log(error);
    });

    step.start();


## API

### Step

#### pipe(context => any)

add a step to controller.

- `context.content` The result from previous step.
- `context.next` A function that go to next step. and if it is not called, the next step will not be executed.

#### catch(error => void)

Add error handling function.

#### start

Start to run the step functions.