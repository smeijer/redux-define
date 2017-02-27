# redux-define

[![Join the chat at https://gitter.im/smeijer/redux-define](https://badges.gitter.im/smeijer/redux-define.svg)](https://gitter.im/smeijer/redux-define?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![build status](https://img.shields.io/travis/smeijer/redux-define/master.svg?style=flat-square)][1]

[![NPM](https://nodei.co/npm/redux-define.png?downloads=true)][7]


## Installation

with npm:
```bash
npm install --save redux-define
```

or yarn:
```bash
yarn add redux-define
```

If you don’t use [npm][2], you may grab the latest [UMD][3] build from [unpkg][4] 
(either a [development][5] or a [production][6] build). The UMD build exports a 
global called `window.ReduxDefine` if you add it to your page via a `<script>` tag. 

We *don’t* recommend UMD builds for any serious application, as most of the libraries 
complementary to Redux are only available on [npm][8].

## Usage

### `defineAction(type, ?[subactions], ?namespace)`

```js
import { defineAction } from 'redux-define';
```

Create a redux action type with one or more subactions:

```js
const CREATE_TODO = defineAction('CREATE_TODO', ['ERROR', 'SUCCESS']);

// result:
console.log('' + CREATE_TODO);            // CREATE_TODO
console.log('' + CREATE_TODO.ERROR);      // CREATE_TODO_ERROR
console.log('' + CREATE_TODO.SUCCESS);    // CREATE_TODO_SUCCESS;
```

Namespaces can be used to separate actions through out modules and apps.

```js
const CREATE_TODO = defineAction('CREATE_TODO', ['ERROR', 'SUCCESS'], 'my-app');

// result:
console.log('' + CREATE_TODO);            // my-app/CREATE_TODO
console.log('' + CREATE_TODO.ERROR);      // my-app/CREATE_TODO_ERROR
console.log('' + CREATE_TODO.SUCCESS);    // my-app/CREATE_TODO_SUCCESS;
```

It's also possible to give in another constant as namespace for the new one.

```js
const todos = defineAction('todos', ['LOADING', 'SUCCESS'], 'my-app');
const CREATE_TODO = defineAction('CREATE_TODO', ['ERROR', 'SUCCESS'], todos);

// result:
console.log('' + CREATE_TODO);            // my-app/todos/CREATE_TODO
console.log('' + CREATE_TODO.ERROR);      // my-app/todos/CREATE_TODO_ERROR
console.log('' + CREATE_TODO.SUCCESS);    // my-app/todos/CREATE_TODO_SUCCESS;
```

To integrate better with other `redux` libraries, a special `ACTION` property is
added to the constant. [`redux-actions`][9] and [`redux-saga`][11] for example 
treat actionTypes other than `string` specially. 

Extra benefit of this little feature, is that it makes the separation between
user actions and status updates more clear. Read more about this under 
[best practice](#best-practice) and [integrations](#integrations)

```js
const CREATE_TODO = defineAction('CREATE_TODO', ['ERROR', 'SUCCESS']);

// result:
console.log('' + CREATE_TODO);            // CREATE_TODO
console.log('' + CREATE_TODO.ACTION);     // CREATE_TODO
console.log('' + CREATE_TODO.ERROR);      // CREATE_TODO_ERROR
console.log('' + CREATE_TODO.SUCCESS);    // CREATE_TODO_SUCCESS;
```

### `actionType.defineAction(type, ?[subactions])`

As alternative syntax, we can use the `defineAction` method on defined constants.
Constants defined in this way inherit their namespace. Making the namespace
argument obsolete.

```js
const myApp = defineAction('my-app');
const todos = myApp.defineAction('todos', ['LOADING', 'SUCCESS']);
const CREATE = todos.defineAction('CREATE', ['ERROR', 'SUCCESS']);
```

This is the same as writing:

```js
const myApp = defineAction('my-app');
const todos = defineAction('todos', ['LOADING', 'SUCCESS'], 'my-app');
const CREATE = todos.defineAction('CREATE', ['ERROR', 'SUCCESS'], todos);
```

Or if you only need the `CREATE` constant:

```js
const CREATE = todos.defineAction('CREATE', ['ERROR', 'SUCCESS'], 'my-app/todos');
```

Result in these cases is the same. Except in the third case, where we only defined
the `CREATE` constant:

```js
console.log('' + myApp);                  // my-app

console.log('' + todos);                  // my-app/todos
console.log('' + todos.LOADING);          // my-app/todos_LOADING
console.log('' + todos.SUCCESS);          // my-app/todos_SUCCESS

console.log('' + CREATE);                 // my-app/todos/CREATE
console.log('' + CREATE.ERROR);           // my-app/todos/CREATE_ERROR;
console.log('' + CREATE.SUCCESS);         // my-app/todos/CREATE_SUCCESS;
```

### Best practice
Extract general state constants into a separate file so they can easily be
imported and shared across different modules:

```js
// stateConstants.js
export const LOADING = 'LOADING';
export const ERROR = 'ERROR';
export const SUCCESS = 'SUCCESS';
```

```js
// app.js
export const myApp = defineAction('my-app');
```

In the module; we can import the `stateConstants` and optionally parent modules
to construct a namespace.

```js
// todos.js
import { defineAction } from 'redux-define';
import { LOADING, ERROR, SUCCESS } from './stateConstants';
import { myApp } from './app';

const todos = defineAction('todos', [LOADING, SUCCESS], myApp);
const CREATE = defineAction('CREATE', [ERROR, SUCCESS], todos);

// result:
console.log('' + myApp);                  // my-app

console.log('' + todos);                  // my-app/todos
console.log('' + todos.LOADING);          // my-app/todos_LOADING
console.log('' + todos.SUCCESS);          // my-app/todos_SUCCESS

console.log('' + CREATE);                 // my-app/todos/CREATE
console.log('' + CREATE.ACTION);          // my-app/todos/CREATE
console.log('' + CREATE.ERROR);           // my-app/todos/CREATE_ERROR
console.log('' + CREATE.SUCCESS);         // my-app/todos/CREATE_SUCCESS
```

Use the `ACTION` constant in `dispatch` and in `saga watchers`. This makes it
clear that an user or system `ACTION` is being handled. All other subtypes 
should be `status` updates. They should be handled trough `thunks` or `sagas`, 
but never dispatched by a user.  Although it is possible to handle user actions 
in the reducer directly, the advice is to not do this. Keep clear separation 
between user actions and reducer actions.

### Implementation example

##### stateConstants.js

```js
export const CANCELLED = 'CANCELLED';
export const ERROR     = 'ERROR';
export const PENDING   = 'PENDING';
export const SUCCESS   = 'SUCCESS';
```

##### actionTypes.js

```js
import { defineAction } from 'redux-define';
import { CANCELLED, ERROR, PENDING, SUCCESS } from './stateConstants';

export const DELETE_COMMENT = defineAction('DELETE_COMMENT',
	[CANCELLED, ERROR, PENDING, SUCCESS], 'comments');
```

##### actions.js

```js
import { createAction } from 'redux-actions';
import { DELETE_COMMENT } from './actionTypes';

export const deleteComment = createAction(DELETE_COMMENT.ACTION);
```

##### reducer.js

```js
import { handleActions, combineActions } from 'redux-actions';
import { DELETE_COMMENT } from './actionTypes';

const initialState = {
  isDeleting: false,
};

const reducer = handleActions({
  [DELETE_COMMENT.PENDING]: state => ({
    ...state,
    isDeleting: true,
  }),

  [combineActions(
    DELETE_COMMENT.CANCELLED,
    DELETE_COMMENT.SUCCESS,
    DELETE_COMMENT.ERROR,
  )]: state => ({
    ...state,
    isDeleting: false,
  }),
}, initialState);
```

##### sagas.js

```js
import { call, put, take } from 'redux-saga/effects';
import deleteAPI from 'somewhere-out-of-this-scope';
import { DELETE_COMMENT } from './actionTypes';

export function* deleteComment({ payload }) {
  try {
    yield put({ type: DELETE_COMMENT.PENDING });
    const { data } = yield call(deleteAPI, payload);
    yield put({ type: DELETE_COMMENT.SUCCESS, payload: data });
  }
  catch (error) {
    yield put({ type: DELETE_COMMENT.ERROR, payload: { error: error.message } });
  }
}
```

##### watchers.js

```js
import { takeEvery } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import { DELETE_COMMENT } from './actionTypes';
import * as s from './sagas';

function* deleteCommentWatcher() {
  yield* takeEvery(DELETE_COMMENT.ACTION, s.deleteComment);
}

export default function* () {
  yield [
    fork(deleteCommentWatcher),
  ];
}

```

### Why use `redux-define`? 
This library reduces a lot of the boilerplate that comes with defining redux
action types. This library is created as solution to [organizing large ducks][10]
Let's show the difference here. See above for a full [implementation example](#implementation-example).
When using `ducks`, some of the files in the example above should be joined into
a single duck file.

Without using `redux-define`

```js
const CREATE_TODO = 'CREATE_TODO';
const CREATE_TODO_PENDING = 'CREATE_TODO_PENDING';
const CREATE_TODO_ERROR = 'CREATE_TODO_ERROR';
const CREATE_TODO_SUCCESS = 'CREATE_TODO_SUCCESS';

const DELETE_TODO = 'DELETE_TODO';
const DELETE_TODO_PENDING = 'DELETE_TODO_PENDING';
const DELETE_TODO_CANCELLED = 'DELETE_TODO_CANCELLED';
const DELETE_TODO_ERROR = 'DELETE_TODO_ERROR';
const DELETE_TODO_SUCCESS = 'DELETE_TODO_SUCCESS';
```

With `redux-define`

```js
import { defineAction } from 'redux-define';
import { PENDING,  CANCELLED, ERROR, SUCCESS } from '/lib/stateConstants.js';

const CREATE_TODO = defineAction('CREATE_TODO', [PENDING, ERROR, SUCCESS]);
const DELETE_TODO = defineAction('DELETE_TODO', [PENDING, CANCELLED, ERROR, SUCCESS]);
```

### Integrations

Created constants can be directly used in [`sagas`][11] `reducers`, or together 
with [`redux-actions`][9].

See [implementation example](#implementation-example) in this readme for implementation
details. We handle [`redux-actions`][9] in [actions.js](#actionsjs) and 
[reducer.js](#reducerjs) and [`redux-saga`][11] in [watchers.js](#watchersjs)
and [sagas.js](#sagasjs).

[1]: https://travis-ci.org/smeijer/redux-define
[2]: https://www.npmjs.com
[3]: https://unpkg.com/redux-define@latest/dist
[4]: https://unpkg.com
[5]: https://unpkg.com/redux-define@latest/dist/redux-define.js
[6]: https://unpkg.com/redux-define@latest/dist/redux-define.min.js
[7]: https://nodei.co/npm/redux-define
[8]: https://www.npmjs.com/search?q=redux
[9]: https://github.com/acdlite/redux-actions
[10]: https://github.com/erikras/ducks-modular-redux/issues/16
[11]: https://github.com/yelouafi/redux-saga
