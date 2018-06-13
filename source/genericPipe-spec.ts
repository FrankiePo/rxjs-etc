/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/rxjs-etc
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { delay, distinctUntilChanged } from "rxjs/operators";
import { marbles } from "rxjs-marbles";
import { expecter } from "ts-snippet";
import { timeout } from "./timeout-spec";
import { genericPipe, pipe } from "./genericPipe";

describe("genericPipe", function (): void {

    /*tslint:disable-next-line:no-invalid-this*/
    this.timeout(timeout);

    describe("functionality", () => {

        it("should export an alias", () => {

            expect(pipe).to.equal(genericPipe);
        });

        it("should pipe a mono-type operator", marbles(m => {

            const source =   m.cold("-a-|");
            const expected =        "--a-|";

            const duration = m.time("-|");
            const operator = genericPipe(delay(duration));
            const destination = source.pipe(operator);
            m.expect(destination).toBeObservable(expected);
        }));

        it("should pipe multiple mono-type operators", marbles(m => {

            const source =   m.cold("-a-a-|");
            const expected =        "--a---|";

            const duration = m.time("-|");
            const operator = genericPipe(delay(duration), distinctUntilChanged());
            const destination = source.pipe(operator);
            m.expect(destination).toBeObservable(expected);
        }));
    });

    if (!global["window"]) {

        describe("types", () => {

            const expectSnippet = expecter(code => `
                import { of } from "rxjs";
                import { delay, map } from "rxjs/operators";
                import { genericPipe } from "./source/genericPipe";
                ${code}
            `);

            it("should infer a non-generic operator for a mono-type operator", () => {

                const snippet = expectSnippet(`
                    const operator = delay(10);
                    const piped = genericPipe(operator);
                    const source = of(1);
                    const delayed = source.pipe(piped);
                `);
                snippet.toInfer("operator", "MonoTypeOperatorFunction<{}>");
                snippet.toInfer("piped", "<R extends {}>(source: Observable<R>) => Observable<R>");
                snippet.toInfer("source", "Observable<number>");
                snippet.toInfer("delayed", "Observable<number>");
            });

            it("should infer a non-generic operator for a non-mono-type operator", () => {

                const snippet = expectSnippet(`
                    const operator = map((value: number) => value.toString());
                    const piped = genericPipe(operator)
                    const source = of(1);
                    const delayed = source.pipe(piped);
                `);
                snippet.toInfer("operator", "OperatorFunction<number, string>");
                snippet.toInfer("piped", "UnaryFunction<Observable<number>, Observable<string>>");
                snippet.toInfer("source", "Observable<number>");
                snippet.toInfer("delayed", "Observable<string>");
            });
        });
    }
});
