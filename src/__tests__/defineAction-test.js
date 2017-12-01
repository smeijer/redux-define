import { expect } from 'chai';
import { defineAction } from '../';

const ERROR = 'ERROR';
const LOADING = 'LOADING';
const SUCCESS = 'SUCCESS';

describe('defineAction()', () => {
  describe('resulting constant', () => {
    it('has the given value', () => {
      const CREATE = defineAction('CREATE');
      expect(`${CREATE}`).to.equal('CREATE');
      expect(CREATE.ACTION).to.equal('CREATE');
    });

    it('can be used in an reducer', () => {
      const CREATE = defineAction('CREATE');
      const state = 'foo';

      const reducer = {
        [CREATE]: (x) => x,
      };

      expect(reducer['CREATE'](state)).to.equal(state);
    });

    it('can define subactions', () => {
      const CREATE = defineAction('CREATE', [ERROR, SUCCESS]);
      expect(`${CREATE}`).to.equal('CREATE');
      expect(CREATE.ACTION).to.equal('CREATE');
      expect(CREATE.ERROR).to.equal('CREATE_ERROR');
      expect(CREATE.SUCCESS).to.equal('CREATE_SUCCESS');
    });

    it('subactions can be used in an reducer', () => {
      const CREATE = defineAction('CREATE', ['SUCCESS']);
      const state = 'foo';

      const reducer = {
        [CREATE]: (x) => x,
        [CREATE.SUCCESS]: (x) => x,
      };

      expect(reducer['CREATE'](state)).to.equal(state);
      expect(reducer['CREATE_SUCCESS'](state)).to.equal(state);
    });

    it('can create namespaces', () => {
      const todos = defineAction('todos', 'my-app');
      expect(`${todos}`).to.equal('my-app/todos');
    });

    it('can create namespaces with subactions', () => {
      const todos = defineAction('todos', [LOADING], 'my-app');
      const CREATE = defineAction('CREATE', [ERROR, SUCCESS], todos);

      expect(todos.LOADING).to.equal('my-app/todos_LOADING');
      expect(CREATE.ERROR).to.equal('my-app/todos/CREATE_ERROR');
      expect(CREATE.SUCCESS).to.equal('my-app/todos/CREATE_SUCCESS');
    });

    it('contains subactions within namespaces', () => {
      const myApp = defineAction('my-app');
      const todos = defineAction('todos', [LOADING], myApp);
      const CREATE = defineAction('CREATE', [ERROR, SUCCESS], todos);

      expect(myApp.ACTION).to.equal('my-app');
      expect(myApp.LOADING).to.equal(undefined);
      expect(myApp.ERROR).to.equal(undefined);
      expect(myApp.SUCCESS).to.equal(undefined);

      expect(todos.ACTION).to.equal('my-app/todos');
      expect(todos.LOADING).to.equal('my-app/todos_LOADING');
      expect(todos.ERROR).to.equal(undefined);
      expect(todos.SUCCESS).to.equal(undefined);

      expect(CREATE.ACTION).to.equal('my-app/todos/CREATE');
      expect(CREATE.LOADING).to.equal(undefined);
      expect(CREATE.ERROR).to.equal('my-app/todos/CREATE_ERROR');
      expect(CREATE.SUCCESS).to.equal('my-app/todos/CREATE_SUCCESS');
    });

    it('can use the extension method', () => {
      const myApp = defineAction('my-app');
      const todos = defineAction('todos', null, myApp);
      const CREATE1 = defineAction('CREATE', [ERROR, SUCCESS], todos);

      const CREATE2 = defineAction('CREATE', [ERROR, SUCCESS], 'my-app/todos');

      expect(`${CREATE1}`).to.equal(`${CREATE2}`);
      expect(`${CREATE1.ERROR}`).to.equal(`${CREATE2.ERROR}`);
      expect(`${CREATE1.SUCCESS}`).to.equal(`${CREATE2.SUCCESS}`);
    });

    it('can use alternative defineAction method', () => {
      const myApp = defineAction('my-app');
      const todos = myApp.defineAction('todos', [LOADING]);
      const CREATE = todos.defineAction('CREATE', [ERROR, SUCCESS]);

      expect(myApp.ACTION).to.equal('my-app');
      expect(myApp.LOADING).to.equal(undefined);
      expect(myApp.ERROR).to.equal(undefined);
      expect(myApp.SUCCESS).to.equal(undefined);

      expect(todos.ACTION).to.equal('my-app/todos');
      expect(todos.LOADING).to.equal('my-app/todos_LOADING');
      expect(todos.ERROR).to.equal(undefined);
      expect(todos.SUCCESS).to.equal(undefined);

      expect(CREATE.ACTION).to.equal('my-app/todos/CREATE');
      expect(CREATE.LOADING).to.equal(undefined);
      expect(CREATE.ERROR).to.equal('my-app/todos/CREATE_ERROR');
      expect(CREATE.SUCCESS).to.equal('my-app/todos/CREATE_SUCCESS');
    });
  });
});
