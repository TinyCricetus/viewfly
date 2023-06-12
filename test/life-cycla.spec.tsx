import { onDestroy, onMount, onPropsChanged, onUpdated, Renderer, useSignal, Viewfly } from '@viewfly/core'
import { createApp } from '@viewfly/platform-browser'

describe('Hooks: onMount', () => {
  let root: HTMLElement
  let app: Viewfly

  beforeEach(() => {
    root = document.createElement('div')
  })

  afterEach(() => {
    if (app) {
      app.destroy()
    }
  })
  test('组件挂载后执行回调', () => {
    const fn = jest.fn()

    function App() {
      onMount(fn)
      return () => {
        return <div></div>
      }
    }

    app = createApp(root, <App/>, false)
    expect(fn).toBeCalled()
  })

  test('组件更新后不调用回调', () => {
    const fn = jest.fn()

    function App() {
      onMount(fn)
      const count = useSignal(0)
      return () => {
        return <div onClick={() => {
          count.set(count() + 1)
        }
        }>{count()}</div>
      }
    }

    app = createApp(root, <App/>, false)
    expect(fn).toHaveBeenCalledTimes(1)
    root.querySelector('div')!.click()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('组件销毁后调用回调', () => {
    const fn = jest.fn()

    function Child() {
      onMount(() => {
        return fn
      })
      return () => {
        return <div></div>
      }
    }

    function App() {
      const bool = useSignal(true)
      return () => {
        return <div onClick={() => {
          bool.set(false)
        }
        }>
          {bool() && <Child/>}
        </div>
      }
    }

    app = createApp(root, <App/>, false)
    root.querySelector('div')!.click()
    app.get(Renderer).refresh()
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('Hooks: onUpdated', () => {
  let root: HTMLElement
  let app: Viewfly

  beforeEach(() => {
    root = document.createElement('div')
  })

  afterEach(() => {
    if (app) {
      app.destroy()
    }
  })

  test('组件更新后触发回调', () => {
    const fn = jest.fn()

    function App() {
      const count = useSignal(0)
      onUpdated(fn)
      return () => {
        return <div onClick={() => {
          count.set(count() + 1)
        }
        }>{count()}</div>
      }
    }

    app = createApp(root, <App/>, false)
    expect(fn).toHaveBeenCalledTimes(1)
    root.querySelector('div')!.click()
    app.get(Renderer).refresh()
    expect(fn).toHaveBeenCalledTimes(2)

    root.querySelector('div')!.click()
    app.get(Renderer).refresh()
    expect(fn).toHaveBeenCalledTimes(3)
  })

  test('子组件更新后触发回调，父组件不触发', () => {
    const fn = jest.fn()
    const fn1 = jest.fn()

    function Child() {
      const count = useSignal(0)
      onUpdated(fn1)
      return () => {
        return <p onClick={() => {
          count.set(count() + 1)
        }
        }>{count()}</p>
      }
    }

    function App() {
      onUpdated(fn)
      return () => {
        return (
          <div>
            <Child/>
          </div>
        )
      }
    }

    app = createApp(root, <App/>, false)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn1).toHaveBeenCalledTimes(1)
    root.querySelector('p')!.click()
    app.get(Renderer).refresh()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn1).toHaveBeenCalledTimes(2)

    root.querySelector('p')!.click()
    app.get(Renderer).refresh()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn1).toHaveBeenCalledTimes(3)
  })

  test('组件更新后调用销毁函数', () => {
    const fn = jest.fn()

    function Child() {
      const count = useSignal(0)
      onUpdated(() => {
        return fn
      })
      return () => {
        return <p onClick={() => {
          count.set(count() + 1)
        }
        }>{count()}</p>
      }
    }

    function App() {
      return () => {
        return (
          <div>
            <Child/>
          </div>
        )
      }
    }

    app = createApp(root, <App/>, false)
    expect(fn).not.toBeCalled()

    root.querySelector('p')!.click()
    app.get(Renderer).refresh()
    expect(fn).toHaveBeenCalledTimes(1)

    root.querySelector('p')!.click()
    app.get(Renderer).refresh()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  test('取消监听后，不再执行回调', () => {
    const fn = jest.fn()

    function App() {
      const count = useSignal(0)

      function update() {
        if (count() > 1) {
          unListen()
        }
        count.set(count() + 1)
      }

      const unListen = onUpdated(() => {
        fn()
      })
      return () => {
        return (
          <div onClick={update}>{count()}</div>
        )
      }
    }

    app = createApp(root, <App/>, false)
    expect(fn).toHaveBeenCalledTimes(1)

    const div = root.querySelector('div')!
    div.click()
    app.get(Renderer).refresh()
    expect(fn).toHaveBeenCalledTimes(2)

    div.click()
    app.get(Renderer).refresh()
    expect(fn).toHaveBeenCalledTimes(3)

    div.click()
    app.get(Renderer).refresh()
    expect(fn).toHaveBeenCalledTimes(3)
  })
})

describe('Hooks: onPropsChanged', () => {
  let root: HTMLElement
  let app: Viewfly

  beforeEach(() => {
    root = document.createElement('div')
  })

  afterEach(() => {
    if (app) {
      app.destroy()
    }
  })

  test('属性变更正常触发回调', () => {
    const fn = jest.fn()

    function Child(props) {
      onPropsChanged(fn)
      return () => {
        return (
          <p>{props.count}</p>
        )
      }
    }

    function App() {
      const count = useSignal(0)

      return () => {
        return (
          <div onClick={() => {
            count.set(count() + 1)
          }
          }>
            <Child count={count()}/>
          </div>
        )
      }
    }

    app = createApp(root, <App/>, false)
    expect(fn).not.toBeCalled()

    root.querySelector('div')!.click()
    app.get(Renderer).refresh()
    expect(fn).toBeCalled()
  })
  test('属性变更可获取前后数据', () => {
    let currentProps!: any
    let oldProps!: any

    function Child(props) {
      onPropsChanged((a, b) => {
        currentProps = a
        oldProps = b
      })
      return () => {
        return (
          <p>{props.count}</p>
        )
      }
    }

    function App() {
      const count = useSignal(0)

      return () => {
        return (
          <div onClick={() => {
            count.set(count() + 1)
          }
          }>
            <Child count={count()}/>
          </div>
        )
      }
    }

    app = createApp(root, <App/>, false)
    root.querySelector('div')!.click()
    app.get(Renderer).refresh()
    expect(currentProps!.count).toBe(1)
    expect(oldProps!.count).toBe(0)
  })

  test('属性变更调用上一次销毁回调函数', () => {
    const fn = jest.fn()

    function Child(props) {
      onPropsChanged(() => {
        return fn
      })
      return () => {
        return (
          <p>{props.count}</p>
        )
      }
    }

    function App() {
      const count = useSignal(0)

      return () => {
        return (
          <div onClick={() => {
            count.set(count() + 1)
          }
          }>
            <Child count={count()}/>
          </div>
        )
      }
    }

    app = createApp(root, <App/>, false)
    root.querySelector('div')!.click()
    app.get(Renderer).refresh()
    expect(fn).not.toBeCalled()

    root.querySelector('div')!.click()
    app.get(Renderer).refresh()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('取消监听后，不再调用回调函数', () => {
    const fn = jest.fn()

    function Child(props) {
      const unListen = onPropsChanged(() => {
        if (props.count > 1) {
          unListen()
        }
        fn()
      })
      return () => {
        return (
          <p>{props.count}</p>
        )
      }
    }

    function App() {
      const count = useSignal(0)

      return () => {
        return (
          <div onClick={() => {
            count.set(count() + 1)
          }
          }>
            <Child count={count()}/>
          </div>
        )
      }
    }

    app = createApp(root, <App/>, false)
    root.querySelector('div')!.click()
    app.get(Renderer).refresh()
    expect(fn).toHaveBeenCalledTimes(1)

    root.querySelector('div')!.click()
    app.get(Renderer).refresh()
    expect(fn).toHaveBeenCalledTimes(2)

    root.querySelector('div')!.click()
    app.get(Renderer).refresh()
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe('Hooks: onDestroy', () => {
  let root: HTMLElement
  let app: Viewfly

  beforeEach(() => {
    root = document.createElement('div')
  })

  afterEach(() => {
    if (app) {
      app.destroy()
    }
  })

  test('组件销毁时调用回调函数', () => {
    const fn = jest.fn()

    function Child() {
      onDestroy(fn)
      return () => {
        return <div></div>
      }
    }

    function App() {
      const bool = useSignal(true)
      return () => {
        return <div onClick={() => {
          bool.set(false)
        }
        }>
          {bool() && <Child/>}
        </div>
      }
    }

    app = createApp(root, <App/>, false)
    expect(fn).not.toBeCalled()
    root.querySelector('div')!.click()
    app.get(Renderer).refresh()

    expect(fn).toHaveBeenCalledTimes(1)
  })
})
