export interface PipeContext<C, R = C> {
    content: C;
    next: (result?: R) => any;
}

export type Pipable<C, R = C> = (context: PipeContext<C, R>) => any;

export class Step {

    private pipes: Pipable<any, any>[] = [];
    private catchHandle: (error: any) => void;

    private goto(index: number) {
        return async (result?: any) => {
            if (index >= this.pipes.length) {
                return;
            }
            try {
                await this.pipes[index]({
                    content: result,
                    next: this.goto(index + 1)
                });
            } catch (error) {
                if (this.catchHandle) {
                    this.catchHandle(error);
                } else {
                    throw new Error(error);
                }
            }
        };
    }

    public pipe<C, R = C>(pipable: Pipable<C, R>): this {
        this.pipes.push(pipable);
        return this;
    }

    public catch(handle: (error: any) => void) {
        this.catchHandle = handle;
        return this;
    }

    public start() {
        this.goto(0)();
    }
}