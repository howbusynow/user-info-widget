
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function is_promise(value) {
    return value && typeof value === 'object' && typeof value.then === 'function';
}
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function validate_store(store, name) {
    if (store != null && typeof store.subscribe !== 'function') {
        throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    }
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
    return function (event) {
        event.preventDefault();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_svg_attributes(node, attributes) {
    for (const key in attributes) {
        attr(node, key, attributes[key]);
    }
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_input_value(input, value) {
    if (value != null || input.value) {
        input.value = value;
    }
}
function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? 'important' : '');
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

const active_docs = new Set();
let active = 0;
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    const doc = node.ownerDocument;
    active_docs.add(doc);
    const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
    const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
    if (!current_rules[name]) {
        current_rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    const previous = (node.style.animation || '').split(', ');
    const next = previous.filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
        node.style.animation = next.join(', ');
        active -= deleted;
        if (!active)
            clear_rules();
    }
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        active_docs.forEach(doc => {
            const stylesheet = doc.__svelte_stylesheet;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            doc.__svelte_rules = {};
        });
        active_docs.clear();
    });
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function add_flush_callback(fn) {
    flush_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
    let config = fn(node, params);
    let running = false;
    let animation_name;
    let task;
    let uid = 0;
    function cleanup() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
        tick(0, 1);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        if (task)
            task.abort();
        running = true;
        add_render_callback(() => dispatch(node, true, 'start'));
        task = loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(1, 0);
                    dispatch(node, true, 'end');
                    cleanup();
                    return running = false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(t, 1 - t);
                }
            }
            return running;
        });
    }
    let started = false;
    return {
        start() {
            if (started)
                return;
            delete_rule(node);
            if (is_function(config)) {
                config = config();
                wait().then(go);
            }
            else {
                go();
            }
        },
        invalidate() {
            started = false;
        },
        end() {
            if (running) {
                cleanup();
                running = false;
            }
        }
    };
}
function create_bidirectional_transition(node, fn, params, intro) {
    let config = fn(node, params);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function init(program, duration) {
        const d = program.b - t;
        duration *= Math.abs(d);
        return {
            a: t,
            b: program.b,
            d,
            duration,
            start: program.start,
            end: program.start + duration,
            group: program.group
        };
    }
    function go(b) {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        const program = {
            start: now() + delay,
            b
        };
        if (!b) {
            // @ts-ignore todo: improve typings
            program.group = outros;
            outros.r += 1;
        }
        if (running_program) {
            pending_program = program;
        }
        else {
            // if this is an intro, and there's a delay, we need to do
            // an initial tick and/or apply CSS animation immediately
            if (css) {
                clear_animation();
                animation_name = create_rule(node, t, b, duration, delay, easing, css);
            }
            if (b)
                tick(0, 1);
            running_program = init(program, duration);
            add_render_callback(() => dispatch(node, b, 'start'));
            loop(now => {
                if (pending_program && now > pending_program.start) {
                    running_program = init(pending_program, duration);
                    pending_program = null;
                    dispatch(node, running_program.b, 'start');
                    if (css) {
                        clear_animation();
                        animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                    }
                }
                if (running_program) {
                    if (now >= running_program.end) {
                        tick(t = running_program.b, 1 - t);
                        dispatch(node, running_program.b, 'end');
                        if (!pending_program) {
                            // we're done
                            if (running_program.b) {
                                // intro — we can tidy up immediately
                                clear_animation();
                            }
                            else {
                                // outro — needs to be coordinated
                                if (!--running_program.group.r)
                                    run_all(running_program.group.c);
                            }
                        }
                        running_program = null;
                    }
                    else if (now >= running_program.start) {
                        const p = now - running_program.start;
                        t = running_program.a + running_program.d * easing(p / running_program.duration);
                        tick(t, 1 - t);
                    }
                }
                return !!(running_program || pending_program);
            });
        }
    }
    return {
        run(b) {
            if (is_function(config)) {
                wait().then(() => {
                    // @ts-ignore
                    config = config();
                    go(b);
                });
            }
            else {
                go(b);
            }
        },
        end() {
            clear_animation();
            running_program = pending_program = null;
        }
    };
}

function handle_promise(promise, info) {
    const token = info.token = {};
    function update(type, index, key, value) {
        if (info.token !== token)
            return;
        info.resolved = value;
        let child_ctx = info.ctx;
        if (key !== undefined) {
            child_ctx = child_ctx.slice();
            child_ctx[key] = value;
        }
        const block = type && (info.current = type)(child_ctx);
        let needs_flush = false;
        if (info.block) {
            if (info.blocks) {
                info.blocks.forEach((block, i) => {
                    if (i !== index && block) {
                        group_outros();
                        transition_out(block, 1, 1, () => {
                            info.blocks[i] = null;
                        });
                        check_outros();
                    }
                });
            }
            else {
                info.block.d(1);
            }
            block.c();
            transition_in(block, 1);
            block.m(info.mount(), info.anchor);
            needs_flush = true;
        }
        info.block = block;
        if (info.blocks)
            info.blocks[index] = block;
        if (needs_flush) {
            flush();
        }
    }
    if (is_promise(promise)) {
        const current_component = get_current_component();
        promise.then(value => {
            set_current_component(current_component);
            update(info.then, 1, info.value, value);
            set_current_component(null);
        }, error => {
            set_current_component(current_component);
            update(info.catch, 2, info.error, error);
            set_current_component(null);
        });
        // if we previously had a then/catch block, destroy it
        if (info.current !== info.pending) {
            update(info.pending, 0);
            return true;
        }
    }
    else {
        if (info.current !== info.then) {
            update(info.then, 1, info.value, promise);
            return true;
        }
        info.resolved = promise;
    }
}

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}

function bind(component, name, callback) {
    const index = component.$$.props[name];
    if (index !== undefined) {
        component.$$.bound[index] = callback;
        callback(component.$$.ctx[index]);
    }
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if ($$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set() {
        // overridden by instance, if it has props
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: '3.21.0' }, detail)));
}
function append_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target, node });
    append(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
    insert(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev("SvelteDOMRemove", { node });
    detach(node);
}
function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
    const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default)
        modifiers.push('preventDefault');
    if (has_stop_propagation)
        modifiers.push('stopPropagation');
    dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
        dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
        dispose();
    };
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
    else
        dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
}
function prop_dev(node, property, value) {
    node[property] = value;
    dispatch_dev("SvelteDOMSetProperty", { node, property, value });
}
function set_data_dev(text, data) {
    data = '' + data;
    if (text.data === data)
        return;
    dispatch_dev("SvelteDOMSetData", { node: text, data });
    text.data = data;
}
function validate_each_argument(arg) {
    if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
        let msg = '{#each} only iterates over array-like objects.';
        if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
            msg += ' You can use a spread to convert this iterable into an array.';
        }
        throw new Error(msg);
    }
}
function validate_slots(name, slot, keys) {
    for (const slot_key of Object.keys(slot)) {
        if (!~keys.indexOf(slot_key)) {
            console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
        }
    }
}
class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
        if (!options || (!options.target && !options.$$inline)) {
            throw new Error(`'target' is a required option`);
        }
        super();
    }
    $destroy() {
        super.$destroy();
        this.$destroy = () => {
            console.warn(`Component was already destroyed`); // eslint-disable-line no-console
        };
    }
    $capture_state() { }
    $inject_state() { }
}

function cubicOut(t) {
    const f = t - 1.0;
    return f * f * f + 1.0;
}

function fade(node, { delay = 0, duration = 400, easing = identity }) {
    const o = +getComputedStyle(node).opacity;
    return {
        delay,
        duration,
        easing,
        css: t => `opacity: ${t * o}`
    };
}
function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const transform = style.transform === 'none' ? '' : style.transform;
    const od = target_opacity * (1 - opacity);
    return {
        delay,
        duration,
        easing,
        css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
    };
}

/* node_modules/svelte-simple-modal/src/Modal.svelte generated by Svelte v3.21.0 */

const { Object: Object_1 } = globals;
const file = "node_modules/svelte-simple-modal/src/Modal.svelte";

function add_css() {
	var style = element("style");
	style.id = "svelte-byb5z0-style";
	style.textContent = ".svelte-byb5z0{box-sizing:border-box}.bg.svelte-byb5z0{position:fixed;z-index:1000;display:flex;flex-direction:column;justify-content:center;width:100vw;height:100vh;background:rgba(0, 0, 0, 0.66)}.window-wrap.svelte-byb5z0{position:relative;margin:2rem;max-height:100%}.window.svelte-byb5z0{position:relative;width:40rem;max-width:100%;max-height:100%;margin:2rem auto;color:black;border-radius:0.5rem;background:white}.content.svelte-byb5z0{position:relative;padding:1rem;max-height:calc(100vh - 4rem);overflow:auto}.close.svelte-byb5z0{display:block;box-sizing:border-box;position:absolute;z-index:1000;top:1rem;right:1rem;margin:0;padding:0;width:1.5rem;height:1.5rem;border:0;color:black;border-radius:1.5rem;background:white;box-shadow:0 0 0 1px black;transition:transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),\n              background 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);-webkit-appearance:none}.close.svelte-byb5z0:before,.close.svelte-byb5z0:after{content:'';display:block;box-sizing:border-box;position:absolute;top:50%;width:1rem;height:1px;background:black;transform-origin:center;transition:height 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),\n              background 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)}.close.svelte-byb5z0:before{transform:translate(0, -50%) rotate(45deg);left:0.25rem}.close.svelte-byb5z0:after{transform:translate(0, -50%) rotate(-45deg);left:0.25rem}.close.svelte-byb5z0:hover{background:black}.close.svelte-byb5z0:hover:before,.close.svelte-byb5z0:hover:after{height:2px;background:white}.close.svelte-byb5z0:focus{border-color:#3399ff;box-shadow:0 0 0 2px #3399ff}.close.svelte-byb5z0:active{transform:scale(0.9)}.close.svelte-byb5z0:hover,.close.svelte-byb5z0:focus,.close.svelte-byb5z0:active{outline:none}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kYWwuc3ZlbHRlIiwic291cmNlcyI6WyJNb2RhbC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgaW1wb3J0IHsgc2V0Q29udGV4dCBhcyBiYXNlU2V0Q29udGV4dCB9IGZyb20gJ3N2ZWx0ZSc7XG4gIGltcG9ydCB7IGZhZGUgfSBmcm9tICdzdmVsdGUvdHJhbnNpdGlvbic7XG5cbiAgZXhwb3J0IGxldCBrZXkgPSAnc2ltcGxlLW1vZGFsJztcbiAgZXhwb3J0IGxldCBjbG9zZUJ1dHRvbiA9IHRydWU7XG4gIGV4cG9ydCBsZXQgY2xvc2VPbkVzYyA9IHRydWU7XG4gIGV4cG9ydCBsZXQgY2xvc2VPbk91dGVyQ2xpY2sgPSB0cnVlO1xuICBleHBvcnQgbGV0IHN0eWxlQmcgPSB7IHRvcDogMCwgbGVmdDogMCB9O1xuICBleHBvcnQgbGV0IHN0eWxlV2luZG93ID0ge307XG4gIGV4cG9ydCBsZXQgc3R5bGVDb250ZW50ID0ge307XG4gIGV4cG9ydCBsZXQgc2V0Q29udGV4dCA9IGJhc2VTZXRDb250ZXh0O1xuICBleHBvcnQgbGV0IHRyYW5zaXRpb25CZyA9IGZhZGU7XG4gIGV4cG9ydCBsZXQgdHJhbnNpdGlvbkJnUHJvcHMgPSB7IGR1cmF0aW9uOiAyNTAgfTtcbiAgZXhwb3J0IGxldCB0cmFuc2l0aW9uV2luZG93ID0gdHJhbnNpdGlvbkJnO1xuICBleHBvcnQgbGV0IHRyYW5zaXRpb25XaW5kb3dQcm9wcyA9IHRyYW5zaXRpb25CZ1Byb3BzO1xuXG4gIGNvbnN0IGRlZmF1bHRTdGF0ZSA9IHtcbiAgICBjbG9zZUJ1dHRvbixcbiAgICBjbG9zZU9uRXNjLFxuICAgIGNsb3NlT25PdXRlckNsaWNrLFxuICAgIHN0eWxlQmcsXG4gICAgc3R5bGVXaW5kb3csXG4gICAgc3R5bGVDb250ZW50LFxuICAgIHRyYW5zaXRpb25CZyxcbiAgICB0cmFuc2l0aW9uQmdQcm9wcyxcbiAgICB0cmFuc2l0aW9uV2luZG93LFxuICAgIHRyYW5zaXRpb25XaW5kb3dQcm9wcyxcbiAgfTtcbiAgbGV0IHN0YXRlID0geyAuLi5kZWZhdWx0U3RhdGUgfTtcblxuICBsZXQgQ29tcG9uZW50ID0gbnVsbDtcbiAgbGV0IHByb3BzID0gbnVsbDtcblxuICBsZXQgYmFja2dyb3VuZDtcbiAgbGV0IHdyYXA7XG5cbiAgY29uc3QgY2FtZWxDYXNlVG9EYXNoID0gc3RyID0+IHN0clxuICAgIC5yZXBsYWNlKC8oW2EtekEtWl0pKD89W0EtWl0pL2csICckMS0nKS50b0xvd2VyQ2FzZSgpO1xuXG4gIGNvbnN0IHRvQ3NzU3RyaW5nID0gKHByb3BzKSA9PiBPYmplY3Qua2V5cyhwcm9wcylcbiAgICAucmVkdWNlKChzdHIsIGtleSkgPT4gYCR7c3RyfTsgJHtjYW1lbENhc2VUb0Rhc2goa2V5KX06ICR7cHJvcHNba2V5XX1gLCAnJyk7XG5cbiAgJDogY3NzQmcgPSB0b0Nzc1N0cmluZyhzdGF0ZS5zdHlsZUJnKTtcbiAgJDogY3NzV2luZG93ID0gdG9Dc3NTdHJpbmcoc3RhdGUuc3R5bGVXaW5kb3cpO1xuICAkOiBjc3NDb250ZW50ID0gdG9Dc3NTdHJpbmcoc3RhdGUuc3R5bGVDb250ZW50KTtcbiAgJDogY3VycmVudFRyYW5zaXRpb25CZyA9IHN0YXRlLnRyYW5zaXRpb25CZztcbiAgJDogY3VycmVudFRyYW5zaXRpb25XaW5kb3cgPSBzdGF0ZS50cmFuc2l0aW9uV2luZG93O1xuXG4gIGNvbnN0IHRvVm9pZCA9ICgpID0+IHt9O1xuICBsZXQgb25PcGVuID0gdG9Wb2lkO1xuICBsZXQgb25DbG9zZSA9IHRvVm9pZDtcbiAgbGV0IG9uT3BlbmVkID0gdG9Wb2lkO1xuICBsZXQgb25DbG9zZWQgPSB0b1ZvaWQ7XG5cbiAgY29uc3Qgb3BlbiA9IChcbiAgICBOZXdDb21wb25lbnQsXG4gICAgbmV3UHJvcHMgPSB7fSxcbiAgICBvcHRpb25zID0ge30sXG4gICAgY2FsbGJhY2sgPSB7fVxuICApID0+IHtcbiAgICBDb21wb25lbnQgPSBOZXdDb21wb25lbnQ7XG4gICAgcHJvcHMgPSBuZXdQcm9wcztcbiAgICBzdGF0ZSA9IHsgLi4uZGVmYXVsdFN0YXRlLCAuLi5vcHRpb25zIH07XG4gICAgb25PcGVuID0gY2FsbGJhY2sub25PcGVuIHx8IHRvVm9pZDtcbiAgICBvbkNsb3NlID0gY2FsbGJhY2sub25DbG9zZSB8fCB0b1ZvaWQ7XG4gICAgb25PcGVuZWQgPSBjYWxsYmFjay5vbk9wZW5lZCB8fCB0b1ZvaWQ7XG4gICAgb25DbG9zZWQgPSBjYWxsYmFjay5vbkNsb3NlZCB8fCB0b1ZvaWQ7XG4gIH07XG5cbiAgY29uc3QgY2xvc2UgPSAoY2FsbGJhY2sgPSB7fSkgPT4ge1xuICAgIG9uQ2xvc2UgPSBjYWxsYmFjay5vbkNsb3NlIHx8IG9uQ2xvc2U7XG4gICAgb25DbG9zZWQgPSBjYWxsYmFjay5vbkNsb3NlZCB8fCBvbkNsb3NlZDtcbiAgICBDb21wb25lbnQgPSBudWxsO1xuICAgIHByb3BzID0gbnVsbDtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVLZXl1cCA9ICh7IGtleSB9KSA9PiB7XG4gICAgaWYgKHN0YXRlLmNsb3NlT25Fc2MgJiYgQ29tcG9uZW50ICYmIGtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjbG9zZSgpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBoYW5kbGVPdXRlckNsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKFxuICAgICAgc3RhdGUuY2xvc2VPbk91dGVyQ2xpY2sgJiYgKFxuICAgICAgICBldmVudC50YXJnZXQgPT09IGJhY2tncm91bmQgfHwgZXZlbnQudGFyZ2V0ID09PSB3cmFwXG4gICAgICApXG4gICAgKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY2xvc2UoKTtcbiAgICB9XG4gIH07XG5cbiAgc2V0Q29udGV4dChrZXksIHsgb3BlbiwgY2xvc2UgfSk7XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuKiB7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG59XG5cbi5iZyB7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgei1pbmRleDogMTAwMDtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIHdpZHRoOiAxMDB2dztcbiAgaGVpZ2h0OiAxMDB2aDtcbiAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjY2KTtcbn1cblxuLndpbmRvdy13cmFwIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBtYXJnaW46IDJyZW07XG4gIG1heC1oZWlnaHQ6IDEwMCU7XG59XG5cbi53aW5kb3cge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHdpZHRoOiA0MHJlbTtcbiAgbWF4LXdpZHRoOiAxMDAlO1xuICBtYXgtaGVpZ2h0OiAxMDAlO1xuICBtYXJnaW46IDJyZW0gYXV0bztcbiAgY29sb3I6IGJsYWNrO1xuICBib3JkZXItcmFkaXVzOiAwLjVyZW07XG4gIGJhY2tncm91bmQ6IHdoaXRlO1xufVxuXG4uY29udGVudCB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgcGFkZGluZzogMXJlbTtcbiAgbWF4LWhlaWdodDogY2FsYygxMDB2aCAtIDRyZW0pO1xuICBvdmVyZmxvdzogYXV0bztcbn1cblxuLmNsb3NlIHtcbiAgZGlzcGxheTogYmxvY2s7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgei1pbmRleDogMTAwMDtcbiAgdG9wOiAxcmVtO1xuICByaWdodDogMXJlbTtcbiAgbWFyZ2luOiAwO1xuICBwYWRkaW5nOiAwO1xuICB3aWR0aDogMS41cmVtO1xuICBoZWlnaHQ6IDEuNXJlbTtcbiAgYm9yZGVyOiAwO1xuICBjb2xvcjogYmxhY2s7XG4gIGJvcmRlci1yYWRpdXM6IDEuNXJlbTtcbiAgYmFja2dyb3VuZDogd2hpdGU7XG4gIGJveC1zaGFkb3c6IDAgMCAwIDFweCBibGFjaztcbiAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMnMgY3ViaWMtYmV6aWVyKDAuMjUsIDAuMSwgMC4yNSwgMSksXG4gICAgICAgICAgICAgIGJhY2tncm91bmQgMC4ycyBjdWJpYy1iZXppZXIoMC4yNSwgMC4xLCAwLjI1LCAxKTtcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xufVxuXG4uY2xvc2U6YmVmb3JlLCAuY2xvc2U6YWZ0ZXIge1xuICBjb250ZW50OiAnJztcbiAgZGlzcGxheTogYmxvY2s7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgdG9wOiA1MCU7XG4gIHdpZHRoOiAxcmVtO1xuICBoZWlnaHQ6IDFweDtcbiAgYmFja2dyb3VuZDogYmxhY2s7XG4gIHRyYW5zZm9ybS1vcmlnaW46IGNlbnRlcjtcbiAgdHJhbnNpdGlvbjogaGVpZ2h0IDAuMnMgY3ViaWMtYmV6aWVyKDAuMjUsIDAuMSwgMC4yNSwgMSksXG4gICAgICAgICAgICAgIGJhY2tncm91bmQgMC4ycyBjdWJpYy1iZXppZXIoMC4yNSwgMC4xLCAwLjI1LCAxKTtcbn1cblxuLmNsb3NlOmJlZm9yZSB7XG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIC01MCUpIHJvdGF0ZSg0NWRlZyk7XG4gIGxlZnQ6IDAuMjVyZW07XG59XG5cbi5jbG9zZTphZnRlciB7XG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIC01MCUpIHJvdGF0ZSgtNDVkZWcpO1xuICBsZWZ0OiAwLjI1cmVtO1xufVxuXG4uY2xvc2U6aG92ZXIge1xuICBiYWNrZ3JvdW5kOiBibGFjaztcbn1cblxuLmNsb3NlOmhvdmVyOmJlZm9yZSwgLmNsb3NlOmhvdmVyOmFmdGVyIHtcbiAgaGVpZ2h0OiAycHg7XG4gIGJhY2tncm91bmQ6IHdoaXRlO1xufVxuXG4uY2xvc2U6Zm9jdXMge1xuICBib3JkZXItY29sb3I6ICMzMzk5ZmY7XG4gIGJveC1zaGFkb3c6IDAgMCAwIDJweCAjMzM5OWZmO1xufVxuXG4uY2xvc2U6YWN0aXZlIHtcbiAgdHJhbnNmb3JtOiBzY2FsZSgwLjkpO1xufVxuXG4uY2xvc2U6aG92ZXIsIC5jbG9zZTpmb2N1cywgLmNsb3NlOmFjdGl2ZSB7XG4gIG91dGxpbmU6IG5vbmU7XG59XG5cbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbTV2WkdWZmJXOWtkV3hsY3k5emRtVnNkR1V0YzJsdGNHeGxMVzF2WkdGc0wzTnlZeTlOYjJSaGJDNXpkbVZzZEdVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVTkJPMFZCUTBVc2MwSkJRWE5DTzBGQlEzaENPenRCUVVWQk8wVkJRMFVzWlVGQlpUdEZRVU5tTEdGQlFXRTdSVUZEWWl4aFFVRmhPMFZCUTJJc2MwSkJRWE5DTzBWQlEzUkNMSFZDUVVGMVFqdEZRVU4yUWl4WlFVRlpPMFZCUTFvc1lVRkJZVHRGUVVOaUxDdENRVUVyUWp0QlFVTnFRenM3UVVGRlFUdEZRVU5GTEd0Q1FVRnJRanRGUVVOc1FpeFpRVUZaTzBWQlExb3NaMEpCUVdkQ08wRkJRMnhDT3p0QlFVVkJPMFZCUTBVc2EwSkJRV3RDTzBWQlEyeENMRmxCUVZrN1JVRkRXaXhsUVVGbE8wVkJRMllzWjBKQlFXZENPMFZCUTJoQ0xHbENRVUZwUWp0RlFVTnFRaXhaUVVGWk8wVkJRMW9zY1VKQlFYRkNPMFZCUTNKQ0xHbENRVUZwUWp0QlFVTnVRanM3UVVGRlFUdEZRVU5GTEd0Q1FVRnJRanRGUVVOc1FpeGhRVUZoTzBWQlEySXNPRUpCUVRoQ08wVkJRemxDTEdOQlFXTTdRVUZEYUVJN08wRkJSVUU3UlVGRFJTeGpRVUZqTzBWQlEyUXNjMEpCUVhOQ08wVkJRM1JDTEd0Q1FVRnJRanRGUVVOc1FpeGhRVUZoTzBWQlEySXNVMEZCVXp0RlFVTlVMRmRCUVZjN1JVRkRXQ3hUUVVGVE8wVkJRMVFzVlVGQlZUdEZRVU5XTEdGQlFXRTdSVUZEWWl4alFVRmpPMFZCUTJRc1UwRkJVenRGUVVOVUxGbEJRVms3UlVGRFdpeHhRa0ZCY1VJN1JVRkRja0lzYVVKQlFXbENPMFZCUTJwQ0xESkNRVUV5UWp0RlFVTXpRanM0UkVGRE5FUTdSVUZETlVRc2QwSkJRWGRDTzBGQlF6RkNPenRCUVVWQk8wVkJRMFVzVjBGQlZ6dEZRVU5ZTEdOQlFXTTdSVUZEWkN4elFrRkJjMEk3UlVGRGRFSXNhMEpCUVd0Q08wVkJRMnhDTEZGQlFWRTdSVUZEVWl4WFFVRlhPMFZCUTFnc1YwRkJWenRGUVVOWUxHbENRVUZwUWp0RlFVTnFRaXgzUWtGQmQwSTdSVUZEZUVJN09FUkJRelJFTzBGQlF6bEVPenRCUVVWQk8wVkJSMFVzTWtOQlFUSkRPMFZCUXpORExHRkJRV0U3UVVGRFpqczdRVUZGUVR0RlFVZEZMRFJEUVVFMFF6dEZRVU0xUXl4aFFVRmhPMEZCUTJZN08wRkJSVUU3UlVGRFJTeHBRa0ZCYVVJN1FVRkRia0k3TzBGQlJVRTdSVUZEUlN4WFFVRlhPMFZCUTFnc2FVSkJRV2xDTzBGQlEyNUNPenRCUVVWQk8wVkJRMFVzY1VKQlFYRkNPMFZCUTNKQ0xEWkNRVUUyUWp0QlFVTXZRanM3UVVGRlFUdEZRVU5GTEhGQ1FVRnhRanRCUVVOMlFqczdRVUZGUVR0RlFVTkZMR0ZCUVdFN1FVRkRaaUlzSW1acGJHVWlPaUp1YjJSbFgyMXZaSFZzWlhNdmMzWmxiSFJsTFhOcGJYQnNaUzF0YjJSaGJDOXpjbU12VFc5a1lXd3VjM1psYkhSbElpd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sc2lYRzRxSUh0Y2JpQWdZbTk0TFhOcGVtbHVaem9nWW05eVpHVnlMV0p2ZUR0Y2JuMWNibHh1TG1KbklIdGNiaUFnY0c5emFYUnBiMjQ2SUdacGVHVmtPMXh1SUNCNkxXbHVaR1Y0T2lBeE1EQXdPMXh1SUNCa2FYTndiR0Y1T2lCbWJHVjRPMXh1SUNCbWJHVjRMV1JwY21WamRHbHZiam9nWTI5c2RXMXVPMXh1SUNCcWRYTjBhV1o1TFdOdmJuUmxiblE2SUdObGJuUmxjanRjYmlBZ2QybGtkR2c2SURFd01IWjNPMXh1SUNCb1pXbG5hSFE2SURFd01IWm9PMXh1SUNCaVlXTnJaM0p2ZFc1a09pQnlaMkpoS0RBc0lEQXNJREFzSURBdU5qWXBPMXh1ZlZ4dVhHNHVkMmx1Wkc5M0xYZHlZWEFnZTF4dUlDQndiM05wZEdsdmJqb2djbVZzWVhScGRtVTdYRzRnSUcxaGNtZHBiam9nTW5KbGJUdGNiaUFnYldGNExXaGxhV2RvZERvZ01UQXdKVHRjYm4xY2JseHVMbmRwYm1SdmR5QjdYRzRnSUhCdmMybDBhVzl1T2lCeVpXeGhkR2wyWlR0Y2JpQWdkMmxrZEdnNklEUXdjbVZ0TzF4dUlDQnRZWGd0ZDJsa2RHZzZJREV3TUNVN1hHNGdJRzFoZUMxb1pXbG5hSFE2SURFd01DVTdYRzRnSUcxaGNtZHBiam9nTW5KbGJTQmhkWFJ2TzF4dUlDQmpiMnh2Y2pvZ1lteGhZMnM3WEc0Z0lHSnZjbVJsY2kxeVlXUnBkWE02SURBdU5YSmxiVHRjYmlBZ1ltRmphMmR5YjNWdVpEb2dkMmhwZEdVN1hHNTlYRzVjYmk1amIyNTBaVzUwSUh0Y2JpQWdjRzl6YVhScGIyNDZJSEpsYkdGMGFYWmxPMXh1SUNCd1lXUmthVzVuT2lBeGNtVnRPMXh1SUNCdFlYZ3RhR1ZwWjJoME9pQmpZV3hqS0RFd01IWm9JQzBnTkhKbGJTazdYRzRnSUc5MlpYSm1iRzkzT2lCaGRYUnZPMXh1ZlZ4dVhHNHVZMnh2YzJVZ2UxeHVJQ0JrYVhOd2JHRjVPaUJpYkc5amF6dGNiaUFnWW05NExYTnBlbWx1WnpvZ1ltOXlaR1Z5TFdKdmVEdGNiaUFnY0c5emFYUnBiMjQ2SUdGaWMyOXNkWFJsTzF4dUlDQjZMV2x1WkdWNE9pQXhNREF3TzF4dUlDQjBiM0E2SURGeVpXMDdYRzRnSUhKcFoyaDBPaUF4Y21WdE8xeHVJQ0J0WVhKbmFXNDZJREE3WEc0Z0lIQmhaR1JwYm1jNklEQTdYRzRnSUhkcFpIUm9PaUF4TGpWeVpXMDdYRzRnSUdobGFXZG9kRG9nTVM0MWNtVnRPMXh1SUNCaWIzSmtaWEk2SURBN1hHNGdJR052Ykc5eU9pQmliR0ZqYXp0Y2JpQWdZbTl5WkdWeUxYSmhaR2wxY3pvZ01TNDFjbVZ0TzF4dUlDQmlZV05yWjNKdmRXNWtPaUIzYUdsMFpUdGNiaUFnWW05NExYTm9ZV1J2ZHpvZ01DQXdJREFnTVhCNElHSnNZV05yTzF4dUlDQjBjbUZ1YzJsMGFXOXVPaUIwY21GdWMyWnZjbTBnTUM0eWN5QmpkV0pwWXkxaVpYcHBaWElvTUM0eU5Td2dNQzR4TENBd0xqSTFMQ0F4S1N4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnWW1GamEyZHliM1Z1WkNBd0xqSnpJR04xWW1sakxXSmxlbWxsY2lnd0xqSTFMQ0F3TGpFc0lEQXVNalVzSURFcE8xeHVJQ0F0ZDJWaWEybDBMV0Z3Y0dWaGNtRnVZMlU2SUc1dmJtVTdYRzU5WEc1Y2JpNWpiRzl6WlRwaVpXWnZjbVVzSUM1amJHOXpaVHBoWm5SbGNpQjdYRzRnSUdOdmJuUmxiblE2SUNjbk8xeHVJQ0JrYVhOd2JHRjVPaUJpYkc5amF6dGNiaUFnWW05NExYTnBlbWx1WnpvZ1ltOXlaR1Z5TFdKdmVEdGNiaUFnY0c5emFYUnBiMjQ2SUdGaWMyOXNkWFJsTzF4dUlDQjBiM0E2SURVd0pUdGNiaUFnZDJsa2RHZzZJREZ5WlcwN1hHNGdJR2hsYVdkb2REb2dNWEI0TzF4dUlDQmlZV05yWjNKdmRXNWtPaUJpYkdGamF6dGNiaUFnZEhKaGJuTm1iM0p0TFc5eWFXZHBiam9nWTJWdWRHVnlPMXh1SUNCMGNtRnVjMmwwYVc5dU9pQm9aV2xuYUhRZ01DNHljeUJqZFdKcFl5MWlaWHBwWlhJb01DNHlOU3dnTUM0eExDQXdMakkxTENBeEtTeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ1ltRmphMmR5YjNWdVpDQXdMakp6SUdOMVltbGpMV0psZW1sbGNpZ3dMakkxTENBd0xqRXNJREF1TWpVc0lERXBPMXh1ZlZ4dVhHNHVZMnh2YzJVNlltVm1iM0psSUh0Y2JpQWdMWGRsWW10cGRDMTBjbUZ1YzJadmNtMDZJSFJ5WVc1emJHRjBaU2d3TENBdE5UQWxLU0J5YjNSaGRHVW9ORFZrWldjcE8xeHVJQ0F0Ylc5NkxYUnlZVzV6Wm05eWJUb2dkSEpoYm5Oc1lYUmxLREFzSUMwMU1DVXBJSEp2ZEdGMFpTZzBOV1JsWnlrN1hHNGdJSFJ5WVc1elptOXliVG9nZEhKaGJuTnNZWFJsS0RBc0lDMDFNQ1VwSUhKdmRHRjBaU2cwTldSbFp5azdYRzRnSUd4bFpuUTZJREF1TWpWeVpXMDdYRzU5WEc1Y2JpNWpiRzl6WlRwaFpuUmxjaUI3WEc0Z0lDMTNaV0pyYVhRdGRISmhibk5tYjNKdE9pQjBjbUZ1YzJ4aGRHVW9NQ3dnTFRVd0pTa2djbTkwWVhSbEtDMDBOV1JsWnlrN1hHNGdJQzF0YjNvdGRISmhibk5tYjNKdE9pQjBjbUZ1YzJ4aGRHVW9NQ3dnTFRVd0pTa2djbTkwWVhSbEtDMDBOV1JsWnlrN1hHNGdJSFJ5WVc1elptOXliVG9nZEhKaGJuTnNZWFJsS0RBc0lDMDFNQ1VwSUhKdmRHRjBaU2d0TkRWa1pXY3BPMXh1SUNCc1pXWjBPaUF3TGpJMWNtVnRPMXh1ZlZ4dVhHNHVZMnh2YzJVNmFHOTJaWElnZTF4dUlDQmlZV05yWjNKdmRXNWtPaUJpYkdGamF6dGNibjFjYmx4dUxtTnNiM05sT21odmRtVnlPbUpsWm05eVpTd2dMbU5zYjNObE9taHZkbVZ5T21GbWRHVnlJSHRjYmlBZ2FHVnBaMmgwT2lBeWNIZzdYRzRnSUdKaFkydG5jbTkxYm1RNklIZG9hWFJsTzF4dWZWeHVYRzR1WTJ4dmMyVTZabTlqZFhNZ2UxeHVJQ0JpYjNKa1pYSXRZMjlzYjNJNklDTXpNems1Wm1ZN1hHNGdJR0p2ZUMxemFHRmtiM2M2SURBZ01DQXdJREp3ZUNBak16TTVPV1ptTzF4dWZWeHVYRzR1WTJ4dmMyVTZZV04wYVhabElIdGNiaUFnZEhKaGJuTm1iM0p0T2lCelkyRnNaU2d3TGprcE8xeHVmVnh1WEc0dVkyeHZjMlU2YUc5MlpYSXNJQzVqYkc5elpUcG1iMk4xY3l3Z0xtTnNiM05sT21GamRHbDJaU0I3WEc0Z0lHOTFkR3hwYm1VNklHNXZibVU3WEc1OVhHNGlYWDA9ICovPC9zdHlsZT5cblxuPHN2ZWx0ZTp3aW5kb3cgb246a2V5dXA9e2hhbmRsZUtleXVwfS8+XG5cbjxkaXY+XG4gIHsjaWYgQ29tcG9uZW50fVxuICAgIDxkaXZcbiAgICAgIGNsYXNzPVwiYmdcIlxuICAgICAgb246Y2xpY2s9e2hhbmRsZU91dGVyQ2xpY2t9XG4gICAgICBiaW5kOnRoaXM9e2JhY2tncm91bmR9XG4gICAgICB0cmFuc2l0aW9uOmN1cnJlbnRUcmFuc2l0aW9uQmc9e3N0YXRlLnRyYW5zaXRpb25CZ1Byb3BzfVxuICAgICAgc3R5bGU9e2Nzc0JnfVxuICAgID5cbiAgICAgIDxkaXYgY2xhc3M9XCJ3aW5kb3ctd3JhcFwiIGJpbmQ6dGhpcz17d3JhcH0+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzcz1cIndpbmRvd1wiXG4gICAgICAgICAgdHJhbnNpdGlvbjpjdXJyZW50VHJhbnNpdGlvbldpbmRvdz17c3RhdGUudHJhbnNpdGlvbldpbmRvd1Byb3BzfVxuICAgICAgICAgIG9uOmludHJvc3RhcnQ9e29uT3Blbn1cbiAgICAgICAgICBvbjpvdXRyb3N0YXJ0PXtvbkNsb3NlfVxuICAgICAgICAgIG9uOmludHJvZW5kPXtvbk9wZW5lZH1cbiAgICAgICAgICBvbjpvdXRyb2VuZD17b25DbG9zZWR9XG4gICAgICAgICAgc3R5bGU9e2Nzc1dpbmRvd31cbiAgICAgICAgPlxuICAgICAgICAgIHsjaWYgc3RhdGUuY2xvc2VCdXR0b259XG4gICAgICAgICAgICA8YnV0dG9uIG9uOmNsaWNrPXtjbG9zZX0gY2xhc3M9XCJjbG9zZVwiPjwvYnV0dG9uPlxuICAgICAgICAgIHsvaWZ9XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIiBzdHlsZT17Y3NzQ29udGVudH0+XG4gICAgICAgICAgICA8c3ZlbHRlOmNvbXBvbmVudCB0aGlzPXtDb21wb25lbnR9IHsuLi5wcm9wc30gLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgey9pZn1cbiAgPHNsb3Q+PC9zbG90PlxuPC9kaXY+XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBbUdBLGNBQUUsQ0FBQyxBQUNELFVBQVUsQ0FBRSxVQUFVLEFBQ3hCLENBQUMsQUFFRCxHQUFHLGNBQUMsQ0FBQyxBQUNILFFBQVEsQ0FBRSxLQUFLLENBQ2YsT0FBTyxDQUFFLElBQUksQ0FDYixPQUFPLENBQUUsSUFBSSxDQUNiLGNBQWMsQ0FBRSxNQUFNLENBQ3RCLGVBQWUsQ0FBRSxNQUFNLENBQ3ZCLEtBQUssQ0FBRSxLQUFLLENBQ1osTUFBTSxDQUFFLEtBQUssQ0FDYixVQUFVLENBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQUFDakMsQ0FBQyxBQUVELFlBQVksY0FBQyxDQUFDLEFBQ1osUUFBUSxDQUFFLFFBQVEsQ0FDbEIsTUFBTSxDQUFFLElBQUksQ0FDWixVQUFVLENBQUUsSUFBSSxBQUNsQixDQUFDLEFBRUQsT0FBTyxjQUFDLENBQUMsQUFDUCxRQUFRLENBQUUsUUFBUSxDQUNsQixLQUFLLENBQUUsS0FBSyxDQUNaLFNBQVMsQ0FBRSxJQUFJLENBQ2YsVUFBVSxDQUFFLElBQUksQ0FDaEIsTUFBTSxDQUFFLElBQUksQ0FBQyxJQUFJLENBQ2pCLEtBQUssQ0FBRSxLQUFLLENBQ1osYUFBYSxDQUFFLE1BQU0sQ0FDckIsVUFBVSxDQUFFLEtBQUssQUFDbkIsQ0FBQyxBQUVELFFBQVEsY0FBQyxDQUFDLEFBQ1IsUUFBUSxDQUFFLFFBQVEsQ0FDbEIsT0FBTyxDQUFFLElBQUksQ0FDYixVQUFVLENBQUUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUM5QixRQUFRLENBQUUsSUFBSSxBQUNoQixDQUFDLEFBRUQsTUFBTSxjQUFDLENBQUMsQUFDTixPQUFPLENBQUUsS0FBSyxDQUNkLFVBQVUsQ0FBRSxVQUFVLENBQ3RCLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLE9BQU8sQ0FBRSxJQUFJLENBQ2IsR0FBRyxDQUFFLElBQUksQ0FDVCxLQUFLLENBQUUsSUFBSSxDQUNYLE1BQU0sQ0FBRSxDQUFDLENBQ1QsT0FBTyxDQUFFLENBQUMsQ0FDVixLQUFLLENBQUUsTUFBTSxDQUNiLE1BQU0sQ0FBRSxNQUFNLENBQ2QsTUFBTSxDQUFFLENBQUMsQ0FDVCxLQUFLLENBQUUsS0FBSyxDQUNaLGFBQWEsQ0FBRSxNQUFNLENBQ3JCLFVBQVUsQ0FBRSxLQUFLLENBQ2pCLFVBQVUsQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUMzQixVQUFVLENBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2NBQ2hELFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDNUQsa0JBQWtCLENBQUUsSUFBSSxBQUMxQixDQUFDLEFBRUQsb0JBQU0sT0FBTyxDQUFFLG9CQUFNLE1BQU0sQUFBQyxDQUFDLEFBQzNCLE9BQU8sQ0FBRSxFQUFFLENBQ1gsT0FBTyxDQUFFLEtBQUssQ0FDZCxVQUFVLENBQUUsVUFBVSxDQUN0QixRQUFRLENBQUUsUUFBUSxDQUNsQixHQUFHLENBQUUsR0FBRyxDQUNSLEtBQUssQ0FBRSxJQUFJLENBQ1gsTUFBTSxDQUFFLEdBQUcsQ0FDWCxVQUFVLENBQUUsS0FBSyxDQUNqQixnQkFBZ0IsQ0FBRSxNQUFNLENBQ3hCLFVBQVUsQ0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Y0FDN0MsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUM5RCxDQUFDLEFBRUQsb0JBQU0sT0FBTyxBQUFDLENBQUMsQUFDYixTQUFTLENBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUMzQyxJQUFJLENBQUUsT0FBTyxBQUNmLENBQUMsQUFFRCxvQkFBTSxNQUFNLEFBQUMsQ0FBQyxBQUNaLFNBQVMsQ0FBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sTUFBTSxDQUFDLENBQzVDLElBQUksQ0FBRSxPQUFPLEFBQ2YsQ0FBQyxBQUVELG9CQUFNLE1BQU0sQUFBQyxDQUFDLEFBQ1osVUFBVSxDQUFFLEtBQUssQUFDbkIsQ0FBQyxBQUVELG9CQUFNLE1BQU0sT0FBTyxDQUFFLG9CQUFNLE1BQU0sTUFBTSxBQUFDLENBQUMsQUFDdkMsTUFBTSxDQUFFLEdBQUcsQ0FDWCxVQUFVLENBQUUsS0FBSyxBQUNuQixDQUFDLEFBRUQsb0JBQU0sTUFBTSxBQUFDLENBQUMsQUFDWixZQUFZLENBQUUsT0FBTyxDQUNyQixVQUFVLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQUFDL0IsQ0FBQyxBQUVELG9CQUFNLE9BQU8sQUFBQyxDQUFDLEFBQ2IsU0FBUyxDQUFFLE1BQU0sR0FBRyxDQUFDLEFBQ3ZCLENBQUMsQUFFRCxvQkFBTSxNQUFNLENBQUUsb0JBQU0sTUFBTSxDQUFFLG9CQUFNLE9BQU8sQUFBQyxDQUFDLEFBQ3pDLE9BQU8sQ0FBRSxJQUFJLEFBQ2YsQ0FBQyJ9 */";
	append_dev(document.head, style);
}

// (211:2) {#if Component}
function create_if_block(ctx) {
	let div3;
	let div2;
	let div1;
	let t;
	let div0;
	let div1_transition;
	let div3_transition;
	let current;
	let dispose;
	let if_block = /*state*/ ctx[0].closeButton && create_if_block_1(ctx);
	const switch_instance_spread_levels = [/*props*/ ctx[2]];
	var switch_value = /*Component*/ ctx[1];

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return {
			props: switch_instance_props,
			$$inline: true
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props());
	}

	const block = {
		c: function create() {
			div3 = element("div");
			div2 = element("div");
			div1 = element("div");
			if (if_block) if_block.c();
			t = space();
			div0 = element("div");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			attr_dev(div0, "class", "content svelte-byb5z0");
			attr_dev(div0, "style", /*cssContent*/ ctx[11]);
			add_location(div0, file, 231, 10, 9331);
			attr_dev(div1, "class", "window svelte-byb5z0");
			attr_dev(div1, "style", /*cssWindow*/ ctx[10]);
			add_location(div1, file, 219, 8, 8934);
			attr_dev(div2, "class", "window-wrap svelte-byb5z0");
			add_location(div2, file, 218, 6, 8883);
			attr_dev(div3, "class", "bg svelte-byb5z0");
			attr_dev(div3, "style", /*cssBg*/ ctx[9]);
			add_location(div3, file, 211, 4, 8703);
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, div3, anchor);
			append_dev(div3, div2);
			append_dev(div2, div1);
			if (if_block) if_block.m(div1, null);
			append_dev(div1, t);
			append_dev(div1, div0);

			if (switch_instance) {
				mount_component(switch_instance, div0, null);
			}

			/*div2_binding*/ ctx[36](div2);
			/*div3_binding*/ ctx[37](div3);
			current = true;
			if (remount) run_all(dispose);

			dispose = [
				listen_dev(
					div1,
					"introstart",
					function () {
						if (is_function(/*onOpen*/ ctx[5])) /*onOpen*/ ctx[5].apply(this, arguments);
					},
					false,
					false,
					false
				),
				listen_dev(
					div1,
					"outrostart",
					function () {
						if (is_function(/*onClose*/ ctx[6])) /*onClose*/ ctx[6].apply(this, arguments);
					},
					false,
					false,
					false
				),
				listen_dev(
					div1,
					"introend",
					function () {
						if (is_function(/*onOpened*/ ctx[7])) /*onOpened*/ ctx[7].apply(this, arguments);
					},
					false,
					false,
					false
				),
				listen_dev(
					div1,
					"outroend",
					function () {
						if (is_function(/*onClosed*/ ctx[8])) /*onClosed*/ ctx[8].apply(this, arguments);
					},
					false,
					false,
					false
				),
				listen_dev(div3, "click", /*handleOuterClick*/ ctx[16], false, false, false)
			];
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;

			if (/*state*/ ctx[0].closeButton) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_1(ctx);
					if_block.c();
					if_block.m(div1, t);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			const switch_instance_changes = (dirty[0] & /*props*/ 4)
			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
			: {};

			if (switch_value !== (switch_value = /*Component*/ ctx[1])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div0, null);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}

			if (!current || dirty[0] & /*cssContent*/ 2048) {
				attr_dev(div0, "style", /*cssContent*/ ctx[11]);
			}

			if (!current || dirty[0] & /*cssWindow*/ 1024) {
				attr_dev(div1, "style", /*cssWindow*/ ctx[10]);
			}

			if (!current || dirty[0] & /*cssBg*/ 512) {
				attr_dev(div3, "style", /*cssBg*/ ctx[9]);
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

			add_render_callback(() => {
				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[13], /*state*/ ctx[0].transitionWindowProps, true);
				div1_transition.run(1);
			});

			add_render_callback(() => {
				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[12], /*state*/ ctx[0].transitionBgProps, true);
				div3_transition.run(1);
			});

			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[13], /*state*/ ctx[0].transitionWindowProps, false);
			div1_transition.run(0);
			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[12], /*state*/ ctx[0].transitionBgProps, false);
			div3_transition.run(0);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div3);
			if (if_block) if_block.d();
			if (switch_instance) destroy_component(switch_instance);
			if (detaching && div1_transition) div1_transition.end();
			/*div2_binding*/ ctx[36](null);
			/*div3_binding*/ ctx[37](null);
			if (detaching && div3_transition) div3_transition.end();
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(211:2) {#if Component}",
		ctx
	});

	return block;
}

// (229:10) {#if state.closeButton}
function create_if_block_1(ctx) {
	let button;
	let dispose;

	const block = {
		c: function create() {
			button = element("button");
			attr_dev(button, "class", "close svelte-byb5z0");
			add_location(button, file, 229, 12, 9256);
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, button, anchor);
			if (remount) dispose();
			dispose = listen_dev(button, "click", /*close*/ ctx[14], false, false, false);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1.name,
		type: "if",
		source: "(229:10) {#if state.closeButton}",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let div;
	let t;
	let current;
	let dispose;
	let if_block = /*Component*/ ctx[1] && create_if_block(ctx);
	const default_slot_template = /*$$slots*/ ctx[35].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[34], null);

	const block = {
		c: function create() {
			div = element("div");
			if (if_block) if_block.c();
			t = space();
			if (default_slot) default_slot.c();
			attr_dev(div, "class", "svelte-byb5z0");
			add_location(div, file, 209, 0, 8675);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, div, anchor);
			if (if_block) if_block.m(div, null);
			append_dev(div, t);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;
			if (remount) dispose();
			dispose = listen_dev(window, "keyup", /*handleKeyup*/ ctx[15], false, false, false);
		},
		p: function update(ctx, dirty) {
			if (/*Component*/ ctx[1]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty[0] & /*Component*/ 2) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(div, t);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}

			if (default_slot) {
				if (default_slot.p && dirty[1] & /*$$scope*/ 8) {
					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[34], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[34], dirty, null));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (if_block) if_block.d();
			if (default_slot) default_slot.d(detaching);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let { key = "simple-modal" } = $$props;
	let { closeButton = true } = $$props;
	let { closeOnEsc = true } = $$props;
	let { closeOnOuterClick = true } = $$props;
	let { styleBg = { top: 0, left: 0 } } = $$props;
	let { styleWindow = {} } = $$props;
	let { styleContent = {} } = $$props;
	let { setContext: setContext$1 = setContext } = $$props;
	let { transitionBg = fade } = $$props;
	let { transitionBgProps = { duration: 250 } } = $$props;
	let { transitionWindow = transitionBg } = $$props;
	let { transitionWindowProps = transitionBgProps } = $$props;

	const defaultState = {
		closeButton,
		closeOnEsc,
		closeOnOuterClick,
		styleBg,
		styleWindow,
		styleContent,
		transitionBg,
		transitionBgProps,
		transitionWindow,
		transitionWindowProps
	};

	let state = { ...defaultState };
	let Component = null;
	let props = null;
	let background;
	let wrap;
	const camelCaseToDash = str => str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
	const toCssString = props => Object.keys(props).reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, "");

	const toVoid = () => {
		
	};

	let onOpen = toVoid;
	let onClose = toVoid;
	let onOpened = toVoid;
	let onClosed = toVoid;

	const open = (NewComponent, newProps = {}, options = {}, callback = {}) => {
		$$invalidate(1, Component = NewComponent);
		$$invalidate(2, props = newProps);
		$$invalidate(0, state = { ...defaultState, ...options });
		$$invalidate(5, onOpen = callback.onOpen || toVoid);
		$$invalidate(6, onClose = callback.onClose || toVoid);
		$$invalidate(7, onOpened = callback.onOpened || toVoid);
		$$invalidate(8, onClosed = callback.onClosed || toVoid);
	};

	const close = (callback = {}) => {
		$$invalidate(6, onClose = callback.onClose || onClose);
		$$invalidate(8, onClosed = callback.onClosed || onClosed);
		$$invalidate(1, Component = null);
		$$invalidate(2, props = null);
	};

	const handleKeyup = ({ key }) => {
		if (state.closeOnEsc && Component && key === "Escape") {
			event.preventDefault();
			close();
		}
	};

	const handleOuterClick = event => {
		if (state.closeOnOuterClick && (event.target === background || event.target === wrap)) {
			event.preventDefault();
			close();
		}
	};

	setContext$1(key, { open, close });

	const writable_props = [
		"key",
		"closeButton",
		"closeOnEsc",
		"closeOnOuterClick",
		"styleBg",
		"styleWindow",
		"styleContent",
		"setContext",
		"transitionBg",
		"transitionBgProps",
		"transitionWindow",
		"transitionWindowProps"
	];

	Object_1.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Modal", $$slots, ['default']);

	function div2_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(4, wrap = $$value);
		});
	}

	function div3_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(3, background = $$value);
		});
	}

	$$self.$set = $$props => {
		if ("key" in $$props) $$invalidate(17, key = $$props.key);
		if ("closeButton" in $$props) $$invalidate(18, closeButton = $$props.closeButton);
		if ("closeOnEsc" in $$props) $$invalidate(19, closeOnEsc = $$props.closeOnEsc);
		if ("closeOnOuterClick" in $$props) $$invalidate(20, closeOnOuterClick = $$props.closeOnOuterClick);
		if ("styleBg" in $$props) $$invalidate(21, styleBg = $$props.styleBg);
		if ("styleWindow" in $$props) $$invalidate(22, styleWindow = $$props.styleWindow);
		if ("styleContent" in $$props) $$invalidate(23, styleContent = $$props.styleContent);
		if ("setContext" in $$props) $$invalidate(24, setContext$1 = $$props.setContext);
		if ("transitionBg" in $$props) $$invalidate(25, transitionBg = $$props.transitionBg);
		if ("transitionBgProps" in $$props) $$invalidate(26, transitionBgProps = $$props.transitionBgProps);
		if ("transitionWindow" in $$props) $$invalidate(27, transitionWindow = $$props.transitionWindow);
		if ("transitionWindowProps" in $$props) $$invalidate(28, transitionWindowProps = $$props.transitionWindowProps);
		if ("$$scope" in $$props) $$invalidate(34, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		baseSetContext: setContext,
		fade,
		key,
		closeButton,
		closeOnEsc,
		closeOnOuterClick,
		styleBg,
		styleWindow,
		styleContent,
		setContext: setContext$1,
		transitionBg,
		transitionBgProps,
		transitionWindow,
		transitionWindowProps,
		defaultState,
		state,
		Component,
		props,
		background,
		wrap,
		camelCaseToDash,
		toCssString,
		toVoid,
		onOpen,
		onClose,
		onOpened,
		onClosed,
		open,
		close,
		handleKeyup,
		handleOuterClick,
		cssBg,
		cssWindow,
		cssContent,
		currentTransitionBg,
		currentTransitionWindow
	});

	$$self.$inject_state = $$props => {
		if ("key" in $$props) $$invalidate(17, key = $$props.key);
		if ("closeButton" in $$props) $$invalidate(18, closeButton = $$props.closeButton);
		if ("closeOnEsc" in $$props) $$invalidate(19, closeOnEsc = $$props.closeOnEsc);
		if ("closeOnOuterClick" in $$props) $$invalidate(20, closeOnOuterClick = $$props.closeOnOuterClick);
		if ("styleBg" in $$props) $$invalidate(21, styleBg = $$props.styleBg);
		if ("styleWindow" in $$props) $$invalidate(22, styleWindow = $$props.styleWindow);
		if ("styleContent" in $$props) $$invalidate(23, styleContent = $$props.styleContent);
		if ("setContext" in $$props) $$invalidate(24, setContext$1 = $$props.setContext);
		if ("transitionBg" in $$props) $$invalidate(25, transitionBg = $$props.transitionBg);
		if ("transitionBgProps" in $$props) $$invalidate(26, transitionBgProps = $$props.transitionBgProps);
		if ("transitionWindow" in $$props) $$invalidate(27, transitionWindow = $$props.transitionWindow);
		if ("transitionWindowProps" in $$props) $$invalidate(28, transitionWindowProps = $$props.transitionWindowProps);
		if ("state" in $$props) $$invalidate(0, state = $$props.state);
		if ("Component" in $$props) $$invalidate(1, Component = $$props.Component);
		if ("props" in $$props) $$invalidate(2, props = $$props.props);
		if ("background" in $$props) $$invalidate(3, background = $$props.background);
		if ("wrap" in $$props) $$invalidate(4, wrap = $$props.wrap);
		if ("onOpen" in $$props) $$invalidate(5, onOpen = $$props.onOpen);
		if ("onClose" in $$props) $$invalidate(6, onClose = $$props.onClose);
		if ("onOpened" in $$props) $$invalidate(7, onOpened = $$props.onOpened);
		if ("onClosed" in $$props) $$invalidate(8, onClosed = $$props.onClosed);
		if ("cssBg" in $$props) $$invalidate(9, cssBg = $$props.cssBg);
		if ("cssWindow" in $$props) $$invalidate(10, cssWindow = $$props.cssWindow);
		if ("cssContent" in $$props) $$invalidate(11, cssContent = $$props.cssContent);
		if ("currentTransitionBg" in $$props) $$invalidate(12, currentTransitionBg = $$props.currentTransitionBg);
		if ("currentTransitionWindow" in $$props) $$invalidate(13, currentTransitionWindow = $$props.currentTransitionWindow);
	};

	let cssBg;
	let cssWindow;
	let cssContent;
	let currentTransitionBg;
	let currentTransitionWindow;

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*state*/ 1) {
			 $$invalidate(9, cssBg = toCssString(state.styleBg));
		}

		if ($$self.$$.dirty[0] & /*state*/ 1) {
			 $$invalidate(10, cssWindow = toCssString(state.styleWindow));
		}

		if ($$self.$$.dirty[0] & /*state*/ 1) {
			 $$invalidate(11, cssContent = toCssString(state.styleContent));
		}

		if ($$self.$$.dirty[0] & /*state*/ 1) {
			 $$invalidate(12, currentTransitionBg = state.transitionBg);
		}

		if ($$self.$$.dirty[0] & /*state*/ 1) {
			 $$invalidate(13, currentTransitionWindow = state.transitionWindow);
		}
	};

	return [
		state,
		Component,
		props,
		background,
		wrap,
		onOpen,
		onClose,
		onOpened,
		onClosed,
		cssBg,
		cssWindow,
		cssContent,
		currentTransitionBg,
		currentTransitionWindow,
		close,
		handleKeyup,
		handleOuterClick,
		key,
		closeButton,
		closeOnEsc,
		closeOnOuterClick,
		styleBg,
		styleWindow,
		styleContent,
		setContext$1,
		transitionBg,
		transitionBgProps,
		transitionWindow,
		transitionWindowProps,
		defaultState,
		camelCaseToDash,
		toCssString,
		toVoid,
		open,
		$$scope,
		$$slots,
		div2_binding,
		div3_binding
	];
}

class Modal extends SvelteComponentDev {
	constructor(options) {
		super(options);
		if (!document.getElementById("svelte-byb5z0-style")) add_css();

		init(
			this,
			options,
			instance,
			create_fragment,
			safe_not_equal,
			{
				key: 17,
				closeButton: 18,
				closeOnEsc: 19,
				closeOnOuterClick: 20,
				styleBg: 21,
				styleWindow: 22,
				styleContent: 23,
				setContext: 24,
				transitionBg: 25,
				transitionBgProps: 26,
				transitionWindow: 27,
				transitionWindowProps: 28
			},
			[-1, -1]
		);

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Modal",
			options,
			id: create_fragment.name
		});
	}

	get key() {
		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set key(value) {
		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get closeButton() {
		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set closeButton(value) {
		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get closeOnEsc() {
		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set closeOnEsc(value) {
		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get closeOnOuterClick() {
		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set closeOnOuterClick(value) {
		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get styleBg() {
		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set styleBg(value) {
		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get styleWindow() {
		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set styleWindow(value) {
		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get styleContent() {
		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set styleContent(value) {
		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get setContext() {
		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set setContext(value) {
		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get transitionBg() {
		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set transitionBg(value) {
		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get transitionBgProps() {
		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set transitionBgProps(value) {
		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get transitionWindow() {
		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set transitionWindow(value) {
		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get transitionWindowProps() {
		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set transitionWindowProps(value) {
		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

const subscriber_queue = [];
/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
function readable(value, start) {
    return {
        subscribe: writable(value, start).subscribe,
    };
}
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}
function derived(stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single
        ? [stores]
        : stores;
    const auto = fn.length < 2;
    return readable(initial_value, (set) => {
        let inited = false;
        const values = [];
        let pending = 0;
        let cleanup = noop;
        const sync = () => {
            if (pending) {
                return;
            }
            cleanup();
            const result = fn(single ? values[0] : values, set);
            if (auto) {
                set(result);
            }
            else {
                cleanup = is_function(result) ? result : noop;
            }
        };
        const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
            values[i] = value;
            pending &= ~(1 << i);
            if (inited) {
                sync();
            }
        }, () => {
            pending |= (1 << i);
        }));
        inited = true;
        sync();
        return function stop() {
            run_all(unsubscribers);
            cleanup();
        };
    });
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var chroma = createCommonjsModule(function (module, exports) {
/**
 * chroma.js - JavaScript library for color conversions
 *
 * Copyright (c) 2011-2019, Gregor Aisch
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. The name Gregor Aisch may not be used to endorse or promote products
 * derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * -------------------------------------------------------
 *
 * chroma.js includes colors from colorbrewer2.org, which are released under
 * the following license:
 *
 * Copyright (c) 2002 Cynthia Brewer, Mark Harrower,
 * and The Pennsylvania State University.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 *
 * ------------------------------------------------------
 *
 * Named colors are taken from X11 Color Names.
 * http://www.w3.org/TR/css3-color/#svg-color
 *
 * @preserve
 */

(function (global, factory) {
     module.exports = factory() ;
}(commonjsGlobal, (function () {
    var limit = function (x, min, max) {
        if ( min === void 0 ) min=0;
        if ( max === void 0 ) max=1;

        return x < min ? min : x > max ? max : x;
    };

    var clip_rgb = function (rgb) {
        rgb._clipped = false;
        rgb._unclipped = rgb.slice(0);
        for (var i=0; i<=3; i++) {
            if (i < 3) {
                if (rgb[i] < 0 || rgb[i] > 255) { rgb._clipped = true; }
                rgb[i] = limit(rgb[i], 0, 255);
            } else if (i === 3) {
                rgb[i] = limit(rgb[i], 0, 1);
            }
        }
        return rgb;
    };

    // ported from jQuery's $.type
    var classToType = {};
    for (var i = 0, list = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Undefined', 'Null']; i < list.length; i += 1) {
        var name = list[i];

        classToType[("[object " + name + "]")] = name.toLowerCase();
    }
    var type = function(obj) {
        return classToType[Object.prototype.toString.call(obj)] || "object";
    };

    var unpack = function (args, keyOrder) {
        if ( keyOrder === void 0 ) keyOrder=null;

    	// if called with more than 3 arguments, we return the arguments
        if (args.length >= 3) { return Array.prototype.slice.call(args); }
        // with less than 3 args we check if first arg is object
        // and use the keyOrder string to extract and sort properties
    	if (type(args[0]) == 'object' && keyOrder) {
    		return keyOrder.split('')
    			.filter(function (k) { return args[0][k] !== undefined; })
    			.map(function (k) { return args[0][k]; });
    	}
    	// otherwise we just return the first argument
    	// (which we suppose is an array of args)
        return args[0];
    };

    var last = function (args) {
        if (args.length < 2) { return null; }
        var l = args.length-1;
        if (type(args[l]) == 'string') { return args[l].toLowerCase(); }
        return null;
    };

    var PI = Math.PI;

    var utils = {
    	clip_rgb: clip_rgb,
    	limit: limit,
    	type: type,
    	unpack: unpack,
    	last: last,
    	PI: PI,
    	TWOPI: PI*2,
    	PITHIRD: PI/3,
    	DEG2RAD: PI / 180,
    	RAD2DEG: 180 / PI
    };

    var input = {
    	format: {},
    	autodetect: []
    };

    var last$1 = utils.last;
    var clip_rgb$1 = utils.clip_rgb;
    var type$1 = utils.type;


    var Color = function Color() {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var me = this;
        if (type$1(args[0]) === 'object' &&
            args[0].constructor &&
            args[0].constructor === this.constructor) {
            // the argument is already a Color instance
            return args[0];
        }

        // last argument could be the mode
        var mode = last$1(args);
        var autodetect = false;

        if (!mode) {
            autodetect = true;
            if (!input.sorted) {
                input.autodetect = input.autodetect.sort(function (a,b) { return b.p - a.p; });
                input.sorted = true;
            }
            // auto-detect format
            for (var i = 0, list = input.autodetect; i < list.length; i += 1) {
                var chk = list[i];

                mode = chk.test.apply(chk, args);
                if (mode) { break; }
            }
        }

        if (input.format[mode]) {
            var rgb = input.format[mode].apply(null, autodetect ? args : args.slice(0,-1));
            me._rgb = clip_rgb$1(rgb);
        } else {
            throw new Error('unknown format: '+args);
        }

        // add alpha channel
        if (me._rgb.length === 3) { me._rgb.push(1); }
    };

    Color.prototype.toString = function toString () {
        if (type$1(this.hex) == 'function') { return this.hex(); }
        return ("[" + (this._rgb.join(',')) + "]");
    };

    var Color_1 = Color;

    var chroma = function () {
    	var args = [], len = arguments.length;
    	while ( len-- ) args[ len ] = arguments[ len ];

    	return new (Function.prototype.bind.apply( chroma.Color, [ null ].concat( args) ));
    };

    chroma.Color = Color_1;
    chroma.version = '2.1.0';

    var chroma_1 = chroma;

    var unpack$1 = utils.unpack;
    var max = Math.max;

    var rgb2cmyk = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$1(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        r = r / 255;
        g = g / 255;
        b = b / 255;
        var k = 1 - max(r,max(g,b));
        var f = k < 1 ? 1 / (1-k) : 0;
        var c = (1-r-k) * f;
        var m = (1-g-k) * f;
        var y = (1-b-k) * f;
        return [c,m,y,k];
    };

    var rgb2cmyk_1 = rgb2cmyk;

    var unpack$2 = utils.unpack;

    var cmyk2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$2(args, 'cmyk');
        var c = args[0];
        var m = args[1];
        var y = args[2];
        var k = args[3];
        var alpha = args.length > 4 ? args[4] : 1;
        if (k === 1) { return [0,0,0,alpha]; }
        return [
            c >= 1 ? 0 : 255 * (1-c) * (1-k), // r
            m >= 1 ? 0 : 255 * (1-m) * (1-k), // g
            y >= 1 ? 0 : 255 * (1-y) * (1-k), // b
            alpha
        ];
    };

    var cmyk2rgb_1 = cmyk2rgb;

    var unpack$3 = utils.unpack;
    var type$2 = utils.type;



    Color_1.prototype.cmyk = function() {
        return rgb2cmyk_1(this._rgb);
    };

    chroma_1.cmyk = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['cmyk']) ));
    };

    input.format.cmyk = cmyk2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$3(args, 'cmyk');
            if (type$2(args) === 'array' && args.length === 4) {
                return 'cmyk';
            }
        }
    });

    var unpack$4 = utils.unpack;
    var last$2 = utils.last;
    var rnd = function (a) { return Math.round(a*100)/100; };

    /*
     * supported arguments:
     * - hsl2css(h,s,l)
     * - hsl2css(h,s,l,a)
     * - hsl2css([h,s,l], mode)
     * - hsl2css([h,s,l,a], mode)
     * - hsl2css({h,s,l,a}, mode)
     */
    var hsl2css = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var hsla = unpack$4(args, 'hsla');
        var mode = last$2(args) || 'lsa';
        hsla[0] = rnd(hsla[0] || 0);
        hsla[1] = rnd(hsla[1]*100) + '%';
        hsla[2] = rnd(hsla[2]*100) + '%';
        if (mode === 'hsla' || (hsla.length > 3 && hsla[3]<1)) {
            hsla[3] = hsla.length > 3 ? hsla[3] : 1;
            mode = 'hsla';
        } else {
            hsla.length = 3;
        }
        return (mode + "(" + (hsla.join(',')) + ")");
    };

    var hsl2css_1 = hsl2css;

    var unpack$5 = utils.unpack;

    /*
     * supported arguments:
     * - rgb2hsl(r,g,b)
     * - rgb2hsl(r,g,b,a)
     * - rgb2hsl([r,g,b])
     * - rgb2hsl([r,g,b,a])
     * - rgb2hsl({r,g,b,a})
     */
    var rgb2hsl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$5(args, 'rgba');
        var r = args[0];
        var g = args[1];
        var b = args[2];

        r /= 255;
        g /= 255;
        b /= 255;

        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);

        var l = (max + min) / 2;
        var s, h;

        if (max === min){
            s = 0;
            h = Number.NaN;
        } else {
            s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
        }

        if (r == max) { h = (g - b) / (max - min); }
        else if (g == max) { h = 2 + (b - r) / (max - min); }
        else if (b == max) { h = 4 + (r - g) / (max - min); }

        h *= 60;
        if (h < 0) { h += 360; }
        if (args.length>3 && args[3]!==undefined) { return [h,s,l,args[3]]; }
        return [h,s,l];
    };

    var rgb2hsl_1 = rgb2hsl;

    var unpack$6 = utils.unpack;
    var last$3 = utils.last;


    var round = Math.round;

    /*
     * supported arguments:
     * - rgb2css(r,g,b)
     * - rgb2css(r,g,b,a)
     * - rgb2css([r,g,b], mode)
     * - rgb2css([r,g,b,a], mode)
     * - rgb2css({r,g,b,a}, mode)
     */
    var rgb2css = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgba = unpack$6(args, 'rgba');
        var mode = last$3(args) || 'rgb';
        if (mode.substr(0,3) == 'hsl') {
            return hsl2css_1(rgb2hsl_1(rgba), mode);
        }
        rgba[0] = round(rgba[0]);
        rgba[1] = round(rgba[1]);
        rgba[2] = round(rgba[2]);
        if (mode === 'rgba' || (rgba.length > 3 && rgba[3]<1)) {
            rgba[3] = rgba.length > 3 ? rgba[3] : 1;
            mode = 'rgba';
        }
        return (mode + "(" + (rgba.slice(0,mode==='rgb'?3:4).join(',')) + ")");
    };

    var rgb2css_1 = rgb2css;

    var unpack$7 = utils.unpack;
    var round$1 = Math.round;

    var hsl2rgb = function () {
        var assign;

        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];
        args = unpack$7(args, 'hsl');
        var h = args[0];
        var s = args[1];
        var l = args[2];
        var r,g,b;
        if (s === 0) {
            r = g = b = l*255;
        } else {
            var t3 = [0,0,0];
            var c = [0,0,0];
            var t2 = l < 0.5 ? l * (1+s) : l+s-l*s;
            var t1 = 2 * l - t2;
            var h_ = h / 360;
            t3[0] = h_ + 1/3;
            t3[1] = h_;
            t3[2] = h_ - 1/3;
            for (var i=0; i<3; i++) {
                if (t3[i] < 0) { t3[i] += 1; }
                if (t3[i] > 1) { t3[i] -= 1; }
                if (6 * t3[i] < 1)
                    { c[i] = t1 + (t2 - t1) * 6 * t3[i]; }
                else if (2 * t3[i] < 1)
                    { c[i] = t2; }
                else if (3 * t3[i] < 2)
                    { c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6; }
                else
                    { c[i] = t1; }
            }
            (assign = [round$1(c[0]*255),round$1(c[1]*255),round$1(c[2]*255)], r = assign[0], g = assign[1], b = assign[2]);
        }
        if (args.length > 3) {
            // keep alpha channel
            return [r,g,b,args[3]];
        }
        return [r,g,b,1];
    };

    var hsl2rgb_1 = hsl2rgb;

    var RE_RGB = /^rgb\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/;
    var RE_RGBA = /^rgba\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([01]|[01]?\.\d+)\)$/;
    var RE_RGB_PCT = /^rgb\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
    var RE_RGBA_PCT = /^rgba\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;
    var RE_HSL = /^hsl\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
    var RE_HSLA = /^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;

    var round$2 = Math.round;

    var css2rgb = function (css) {
        css = css.toLowerCase().trim();
        var m;

        if (input.format.named) {
            try {
                return input.format.named(css);
            } catch (e) {
                // eslint-disable-next-line
            }
        }

        // rgb(250,20,0)
        if ((m = css.match(RE_RGB))) {
            var rgb = m.slice(1,4);
            for (var i=0; i<3; i++) {
                rgb[i] = +rgb[i];
            }
            rgb[3] = 1;  // default alpha
            return rgb;
        }

        // rgba(250,20,0,0.4)
        if ((m = css.match(RE_RGBA))) {
            var rgb$1 = m.slice(1,5);
            for (var i$1=0; i$1<4; i$1++) {
                rgb$1[i$1] = +rgb$1[i$1];
            }
            return rgb$1;
        }

        // rgb(100%,0%,0%)
        if ((m = css.match(RE_RGB_PCT))) {
            var rgb$2 = m.slice(1,4);
            for (var i$2=0; i$2<3; i$2++) {
                rgb$2[i$2] = round$2(rgb$2[i$2] * 2.55);
            }
            rgb$2[3] = 1;  // default alpha
            return rgb$2;
        }

        // rgba(100%,0%,0%,0.4)
        if ((m = css.match(RE_RGBA_PCT))) {
            var rgb$3 = m.slice(1,5);
            for (var i$3=0; i$3<3; i$3++) {
                rgb$3[i$3] = round$2(rgb$3[i$3] * 2.55);
            }
            rgb$3[3] = +rgb$3[3];
            return rgb$3;
        }

        // hsl(0,100%,50%)
        if ((m = css.match(RE_HSL))) {
            var hsl = m.slice(1,4);
            hsl[1] *= 0.01;
            hsl[2] *= 0.01;
            var rgb$4 = hsl2rgb_1(hsl);
            rgb$4[3] = 1;
            return rgb$4;
        }

        // hsla(0,100%,50%,0.5)
        if ((m = css.match(RE_HSLA))) {
            var hsl$1 = m.slice(1,4);
            hsl$1[1] *= 0.01;
            hsl$1[2] *= 0.01;
            var rgb$5 = hsl2rgb_1(hsl$1);
            rgb$5[3] = +m[4];  // default alpha = 1
            return rgb$5;
        }
    };

    css2rgb.test = function (s) {
        return RE_RGB.test(s) ||
            RE_RGBA.test(s) ||
            RE_RGB_PCT.test(s) ||
            RE_RGBA_PCT.test(s) ||
            RE_HSL.test(s) ||
            RE_HSLA.test(s);
    };

    var css2rgb_1 = css2rgb;

    var type$3 = utils.type;




    Color_1.prototype.css = function(mode) {
        return rgb2css_1(this._rgb, mode);
    };

    chroma_1.css = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['css']) ));
    };

    input.format.css = css2rgb_1;

    input.autodetect.push({
        p: 5,
        test: function (h) {
            var rest = [], len = arguments.length - 1;
            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

            if (!rest.length && type$3(h) === 'string' && css2rgb_1.test(h)) {
                return 'css';
            }
        }
    });

    var unpack$8 = utils.unpack;

    input.format.gl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgb = unpack$8(args, 'rgba');
        rgb[0] *= 255;
        rgb[1] *= 255;
        rgb[2] *= 255;
        return rgb;
    };

    chroma_1.gl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['gl']) ));
    };

    Color_1.prototype.gl = function() {
        var rgb = this._rgb;
        return [rgb[0]/255, rgb[1]/255, rgb[2]/255, rgb[3]];
    };

    var unpack$9 = utils.unpack;

    var rgb2hcg = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$9(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var delta = max - min;
        var c = delta * 100 / 255;
        var _g = min / (255 - delta) * 100;
        var h;
        if (delta === 0) {
            h = Number.NaN;
        } else {
            if (r === max) { h = (g - b) / delta; }
            if (g === max) { h = 2+(b - r) / delta; }
            if (b === max) { h = 4+(r - g) / delta; }
            h *= 60;
            if (h < 0) { h += 360; }
        }
        return [h, c, _g];
    };

    var rgb2hcg_1 = rgb2hcg;

    var unpack$a = utils.unpack;
    var floor = Math.floor;

    /*
     * this is basically just HSV with some minor tweaks
     *
     * hue.. [0..360]
     * chroma .. [0..1]
     * grayness .. [0..1]
     */

    var hcg2rgb = function () {
        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];
        args = unpack$a(args, 'hcg');
        var h = args[0];
        var c = args[1];
        var _g = args[2];
        var r,g,b;
        _g = _g * 255;
        var _c = c * 255;
        if (c === 0) {
            r = g = b = _g;
        } else {
            if (h === 360) { h = 0; }
            if (h > 360) { h -= 360; }
            if (h < 0) { h += 360; }
            h /= 60;
            var i = floor(h);
            var f = h - i;
            var p = _g * (1 - c);
            var q = p + _c * (1 - f);
            var t = p + _c * f;
            var v = p + _c;
            switch (i) {
                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
            }
        }
        return [r, g, b, args.length > 3 ? args[3] : 1];
    };

    var hcg2rgb_1 = hcg2rgb;

    var unpack$b = utils.unpack;
    var type$4 = utils.type;






    Color_1.prototype.hcg = function() {
        return rgb2hcg_1(this._rgb);
    };

    chroma_1.hcg = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hcg']) ));
    };

    input.format.hcg = hcg2rgb_1;

    input.autodetect.push({
        p: 1,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$b(args, 'hcg');
            if (type$4(args) === 'array' && args.length === 3) {
                return 'hcg';
            }
        }
    });

    var unpack$c = utils.unpack;
    var last$4 = utils.last;
    var round$3 = Math.round;

    var rgb2hex = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$c(args, 'rgba');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var a = ref[3];
        var mode = last$4(args) || 'auto';
        if (a === undefined) { a = 1; }
        if (mode === 'auto') {
            mode = a < 1 ? 'rgba' : 'rgb';
        }
        r = round$3(r);
        g = round$3(g);
        b = round$3(b);
        var u = r << 16 | g << 8 | b;
        var str = "000000" + u.toString(16); //#.toUpperCase();
        str = str.substr(str.length - 6);
        var hxa = '0' + round$3(a * 255).toString(16);
        hxa = hxa.substr(hxa.length - 2);
        switch (mode.toLowerCase()) {
            case 'rgba': return ("#" + str + hxa);
            case 'argb': return ("#" + hxa + str);
            default: return ("#" + str);
        }
    };

    var rgb2hex_1 = rgb2hex;

    var RE_HEX = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    var RE_HEXA = /^#?([A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/;

    var hex2rgb = function (hex) {
        if (hex.match(RE_HEX)) {
            // remove optional leading #
            if (hex.length === 4 || hex.length === 7) {
                hex = hex.substr(1);
            }
            // expand short-notation to full six-digit
            if (hex.length === 3) {
                hex = hex.split('');
                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            }
            var u = parseInt(hex, 16);
            var r = u >> 16;
            var g = u >> 8 & 0xFF;
            var b = u & 0xFF;
            return [r,g,b,1];
        }

        // match rgba hex format, eg #FF000077
        if (hex.match(RE_HEXA)) {
            if (hex.length === 5 || hex.length === 9) {
                // remove optional leading #
                hex = hex.substr(1);
            }
            // expand short-notation to full eight-digit
            if (hex.length === 4) {
                hex = hex.split('');
                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
            }
            var u$1 = parseInt(hex, 16);
            var r$1 = u$1 >> 24 & 0xFF;
            var g$1 = u$1 >> 16 & 0xFF;
            var b$1 = u$1 >> 8 & 0xFF;
            var a = Math.round((u$1 & 0xFF) / 0xFF * 100) / 100;
            return [r$1,g$1,b$1,a];
        }

        // we used to check for css colors here
        // if _input.css? and rgb = _input.css hex
        //     return rgb

        throw new Error(("unknown hex color: " + hex));
    };

    var hex2rgb_1 = hex2rgb;

    var type$5 = utils.type;




    Color_1.prototype.hex = function(mode) {
        return rgb2hex_1(this._rgb, mode);
    };

    chroma_1.hex = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hex']) ));
    };

    input.format.hex = hex2rgb_1;
    input.autodetect.push({
        p: 4,
        test: function (h) {
            var rest = [], len = arguments.length - 1;
            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

            if (!rest.length && type$5(h) === 'string' && [3,4,5,6,7,8,9].indexOf(h.length) >= 0) {
                return 'hex';
            }
        }
    });

    var unpack$d = utils.unpack;
    var TWOPI = utils.TWOPI;
    var min = Math.min;
    var sqrt = Math.sqrt;
    var acos = Math.acos;

    var rgb2hsi = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
        */
        var ref = unpack$d(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        r /= 255;
        g /= 255;
        b /= 255;
        var h;
        var min_ = min(r,g,b);
        var i = (r+g+b) / 3;
        var s = i > 0 ? 1 - min_/i : 0;
        if (s === 0) {
            h = NaN;
        } else {
            h = ((r-g)+(r-b)) / 2;
            h /= sqrt((r-g)*(r-g) + (r-b)*(g-b));
            h = acos(h);
            if (b > g) {
                h = TWOPI - h;
            }
            h /= TWOPI;
        }
        return [h*360,s,i];
    };

    var rgb2hsi_1 = rgb2hsi;

    var unpack$e = utils.unpack;
    var limit$1 = utils.limit;
    var TWOPI$1 = utils.TWOPI;
    var PITHIRD = utils.PITHIRD;
    var cos = Math.cos;

    /*
     * hue [0..360]
     * saturation [0..1]
     * intensity [0..1]
     */
    var hsi2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
        */
        args = unpack$e(args, 'hsi');
        var h = args[0];
        var s = args[1];
        var i = args[2];
        var r,g,b;

        if (isNaN(h)) { h = 0; }
        if (isNaN(s)) { s = 0; }
        // normalize hue
        if (h > 360) { h -= 360; }
        if (h < 0) { h += 360; }
        h /= 360;
        if (h < 1/3) {
            b = (1-s)/3;
            r = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
            g = 1 - (b+r);
        } else if (h < 2/3) {
            h -= 1/3;
            r = (1-s)/3;
            g = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
            b = 1 - (r+g);
        } else {
            h -= 2/3;
            g = (1-s)/3;
            b = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
            r = 1 - (g+b);
        }
        r = limit$1(i*r*3);
        g = limit$1(i*g*3);
        b = limit$1(i*b*3);
        return [r*255, g*255, b*255, args.length > 3 ? args[3] : 1];
    };

    var hsi2rgb_1 = hsi2rgb;

    var unpack$f = utils.unpack;
    var type$6 = utils.type;






    Color_1.prototype.hsi = function() {
        return rgb2hsi_1(this._rgb);
    };

    chroma_1.hsi = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsi']) ));
    };

    input.format.hsi = hsi2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$f(args, 'hsi');
            if (type$6(args) === 'array' && args.length === 3) {
                return 'hsi';
            }
        }
    });

    var unpack$g = utils.unpack;
    var type$7 = utils.type;






    Color_1.prototype.hsl = function() {
        return rgb2hsl_1(this._rgb);
    };

    chroma_1.hsl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsl']) ));
    };

    input.format.hsl = hsl2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$g(args, 'hsl');
            if (type$7(args) === 'array' && args.length === 3) {
                return 'hsl';
            }
        }
    });

    var unpack$h = utils.unpack;
    var min$1 = Math.min;
    var max$1 = Math.max;

    /*
     * supported arguments:
     * - rgb2hsv(r,g,b)
     * - rgb2hsv([r,g,b])
     * - rgb2hsv({r,g,b})
     */
    var rgb2hsl$1 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$h(args, 'rgb');
        var r = args[0];
        var g = args[1];
        var b = args[2];
        var min_ = min$1(r, g, b);
        var max_ = max$1(r, g, b);
        var delta = max_ - min_;
        var h,s,v;
        v = max_ / 255.0;
        if (max_ === 0) {
            h = Number.NaN;
            s = 0;
        } else {
            s = delta / max_;
            if (r === max_) { h = (g - b) / delta; }
            if (g === max_) { h = 2+(b - r) / delta; }
            if (b === max_) { h = 4+(r - g) / delta; }
            h *= 60;
            if (h < 0) { h += 360; }
        }
        return [h, s, v]
    };

    var rgb2hsv = rgb2hsl$1;

    var unpack$i = utils.unpack;
    var floor$1 = Math.floor;

    var hsv2rgb = function () {
        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];
        args = unpack$i(args, 'hsv');
        var h = args[0];
        var s = args[1];
        var v = args[2];
        var r,g,b;
        v *= 255;
        if (s === 0) {
            r = g = b = v;
        } else {
            if (h === 360) { h = 0; }
            if (h > 360) { h -= 360; }
            if (h < 0) { h += 360; }
            h /= 60;

            var i = floor$1(h);
            var f = h - i;
            var p = v * (1 - s);
            var q = v * (1 - s * f);
            var t = v * (1 - s * (1 - f));

            switch (i) {
                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
            }
        }
        return [r,g,b,args.length > 3?args[3]:1];
    };

    var hsv2rgb_1 = hsv2rgb;

    var unpack$j = utils.unpack;
    var type$8 = utils.type;






    Color_1.prototype.hsv = function() {
        return rgb2hsv(this._rgb);
    };

    chroma_1.hsv = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsv']) ));
    };

    input.format.hsv = hsv2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$j(args, 'hsv');
            if (type$8(args) === 'array' && args.length === 3) {
                return 'hsv';
            }
        }
    });

    var labConstants = {
        // Corresponds roughly to RGB brighter/darker
        Kn: 18,

        // D65 standard referent
        Xn: 0.950470,
        Yn: 1,
        Zn: 1.088830,

        t0: 0.137931034,  // 4 / 29
        t1: 0.206896552,  // 6 / 29
        t2: 0.12841855,   // 3 * t1 * t1
        t3: 0.008856452,  // t1 * t1 * t1
    };

    var unpack$k = utils.unpack;
    var pow = Math.pow;

    var rgb2lab = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$k(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = rgb2xyz(r,g,b);
        var x = ref$1[0];
        var y = ref$1[1];
        var z = ref$1[2];
        var l = 116 * y - 16;
        return [l < 0 ? 0 : l, 500 * (x - y), 200 * (y - z)];
    };

    var rgb_xyz = function (r) {
        if ((r /= 255) <= 0.04045) { return r / 12.92; }
        return pow((r + 0.055) / 1.055, 2.4);
    };

    var xyz_lab = function (t) {
        if (t > labConstants.t3) { return pow(t, 1 / 3); }
        return t / labConstants.t2 + labConstants.t0;
    };

    var rgb2xyz = function (r,g,b) {
        r = rgb_xyz(r);
        g = rgb_xyz(g);
        b = rgb_xyz(b);
        var x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / labConstants.Xn);
        var y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / labConstants.Yn);
        var z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / labConstants.Zn);
        return [x,y,z];
    };

    var rgb2lab_1 = rgb2lab;

    var unpack$l = utils.unpack;
    var pow$1 = Math.pow;

    /*
     * L* [0..100]
     * a [-100..100]
     * b [-100..100]
     */
    var lab2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$l(args, 'lab');
        var l = args[0];
        var a = args[1];
        var b = args[2];
        var x,y,z, r,g,b_;

        y = (l + 16) / 116;
        x = isNaN(a) ? y : y + a / 500;
        z = isNaN(b) ? y : y - b / 200;

        y = labConstants.Yn * lab_xyz(y);
        x = labConstants.Xn * lab_xyz(x);
        z = labConstants.Zn * lab_xyz(z);

        r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);  // D65 -> sRGB
        g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
        b_ = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);

        return [r,g,b_,args.length > 3 ? args[3] : 1];
    };

    var xyz_rgb = function (r) {
        return 255 * (r <= 0.00304 ? 12.92 * r : 1.055 * pow$1(r, 1 / 2.4) - 0.055)
    };

    var lab_xyz = function (t) {
        return t > labConstants.t1 ? t * t * t : labConstants.t2 * (t - labConstants.t0)
    };

    var lab2rgb_1 = lab2rgb;

    var unpack$m = utils.unpack;
    var type$9 = utils.type;






    Color_1.prototype.lab = function() {
        return rgb2lab_1(this._rgb);
    };

    chroma_1.lab = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['lab']) ));
    };

    input.format.lab = lab2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$m(args, 'lab');
            if (type$9(args) === 'array' && args.length === 3) {
                return 'lab';
            }
        }
    });

    var unpack$n = utils.unpack;
    var RAD2DEG = utils.RAD2DEG;
    var sqrt$1 = Math.sqrt;
    var atan2 = Math.atan2;
    var round$4 = Math.round;

    var lab2lch = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$n(args, 'lab');
        var l = ref[0];
        var a = ref[1];
        var b = ref[2];
        var c = sqrt$1(a * a + b * b);
        var h = (atan2(b, a) * RAD2DEG + 360) % 360;
        if (round$4(c*10000) === 0) { h = Number.NaN; }
        return [l, c, h];
    };

    var lab2lch_1 = lab2lch;

    var unpack$o = utils.unpack;



    var rgb2lch = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$o(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = rgb2lab_1(r,g,b);
        var l = ref$1[0];
        var a = ref$1[1];
        var b_ = ref$1[2];
        return lab2lch_1(l,a,b_);
    };

    var rgb2lch_1 = rgb2lch;

    var unpack$p = utils.unpack;
    var DEG2RAD = utils.DEG2RAD;
    var sin = Math.sin;
    var cos$1 = Math.cos;

    var lch2lab = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        /*
        Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
        These formulas were invented by David Dalrymple to obtain maximum contrast without going
        out of gamut if the parameters are in the range 0-1.

        A saturation multiplier was added by Gregor Aisch
        */
        var ref = unpack$p(args, 'lch');
        var l = ref[0];
        var c = ref[1];
        var h = ref[2];
        if (isNaN(h)) { h = 0; }
        h = h * DEG2RAD;
        return [l, cos$1(h) * c, sin(h) * c]
    };

    var lch2lab_1 = lch2lab;

    var unpack$q = utils.unpack;



    var lch2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$q(args, 'lch');
        var l = args[0];
        var c = args[1];
        var h = args[2];
        var ref = lch2lab_1 (l,c,h);
        var L = ref[0];
        var a = ref[1];
        var b_ = ref[2];
        var ref$1 = lab2rgb_1 (L,a,b_);
        var r = ref$1[0];
        var g = ref$1[1];
        var b = ref$1[2];
        return [r, g, b, args.length > 3 ? args[3] : 1];
    };

    var lch2rgb_1 = lch2rgb;

    var unpack$r = utils.unpack;


    var hcl2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var hcl = unpack$r(args, 'hcl').reverse();
        return lch2rgb_1.apply(void 0, hcl);
    };

    var hcl2rgb_1 = hcl2rgb;

    var unpack$s = utils.unpack;
    var type$a = utils.type;






    Color_1.prototype.lch = function() { return rgb2lch_1(this._rgb); };
    Color_1.prototype.hcl = function() { return rgb2lch_1(this._rgb).reverse(); };

    chroma_1.lch = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['lch']) ));
    };
    chroma_1.hcl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hcl']) ));
    };

    input.format.lch = lch2rgb_1;
    input.format.hcl = hcl2rgb_1;

    ['lch','hcl'].forEach(function (m) { return input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$s(args, m);
            if (type$a(args) === 'array' && args.length === 3) {
                return m;
            }
        }
    }); });

    /**
    	X11 color names

    	http://www.w3.org/TR/css3-color/#svg-color
    */

    var w3cx11 = {
        aliceblue: '#f0f8ff',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        aquamarine: '#7fffd4',
        azure: '#f0ffff',
        beige: '#f5f5dc',
        bisque: '#ffe4c4',
        black: '#000000',
        blanchedalmond: '#ffebcd',
        blue: '#0000ff',
        blueviolet: '#8a2be2',
        brown: '#a52a2a',
        burlywood: '#deb887',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        cornflower: '#6495ed',
        cornflowerblue: '#6495ed',
        cornsilk: '#fff8dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkgray: '#a9a9a9',
        darkgreen: '#006400',
        darkgrey: '#a9a9a9',
        darkkhaki: '#bdb76b',
        darkmagenta: '#8b008b',
        darkolivegreen: '#556b2f',
        darkorange: '#ff8c00',
        darkorchid: '#9932cc',
        darkred: '#8b0000',
        darksalmon: '#e9967a',
        darkseagreen: '#8fbc8f',
        darkslateblue: '#483d8b',
        darkslategray: '#2f4f4f',
        darkslategrey: '#2f4f4f',
        darkturquoise: '#00ced1',
        darkviolet: '#9400d3',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        dimgray: '#696969',
        dimgrey: '#696969',
        dodgerblue: '#1e90ff',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        forestgreen: '#228b22',
        fuchsia: '#ff00ff',
        gainsboro: '#dcdcdc',
        ghostwhite: '#f8f8ff',
        gold: '#ffd700',
        goldenrod: '#daa520',
        gray: '#808080',
        green: '#008000',
        greenyellow: '#adff2f',
        grey: '#808080',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        indianred: '#cd5c5c',
        indigo: '#4b0082',
        ivory: '#fffff0',
        khaki: '#f0e68c',
        laserlemon: '#ffff54',
        lavender: '#e6e6fa',
        lavenderblush: '#fff0f5',
        lawngreen: '#7cfc00',
        lemonchiffon: '#fffacd',
        lightblue: '#add8e6',
        lightcoral: '#f08080',
        lightcyan: '#e0ffff',
        lightgoldenrod: '#fafad2',
        lightgoldenrodyellow: '#fafad2',
        lightgray: '#d3d3d3',
        lightgreen: '#90ee90',
        lightgrey: '#d3d3d3',
        lightpink: '#ffb6c1',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        lightskyblue: '#87cefa',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        lightsteelblue: '#b0c4de',
        lightyellow: '#ffffe0',
        lime: '#00ff00',
        limegreen: '#32cd32',
        linen: '#faf0e6',
        magenta: '#ff00ff',
        maroon: '#800000',
        maroon2: '#7f0000',
        maroon3: '#b03060',
        mediumaquamarine: '#66cdaa',
        mediumblue: '#0000cd',
        mediumorchid: '#ba55d3',
        mediumpurple: '#9370db',
        mediumseagreen: '#3cb371',
        mediumslateblue: '#7b68ee',
        mediumspringgreen: '#00fa9a',
        mediumturquoise: '#48d1cc',
        mediumvioletred: '#c71585',
        midnightblue: '#191970',
        mintcream: '#f5fffa',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        navajowhite: '#ffdead',
        navy: '#000080',
        oldlace: '#fdf5e6',
        olive: '#808000',
        olivedrab: '#6b8e23',
        orange: '#ffa500',
        orangered: '#ff4500',
        orchid: '#da70d6',
        palegoldenrod: '#eee8aa',
        palegreen: '#98fb98',
        paleturquoise: '#afeeee',
        palevioletred: '#db7093',
        papayawhip: '#ffefd5',
        peachpuff: '#ffdab9',
        peru: '#cd853f',
        pink: '#ffc0cb',
        plum: '#dda0dd',
        powderblue: '#b0e0e6',
        purple: '#800080',
        purple2: '#7f007f',
        purple3: '#a020f0',
        rebeccapurple: '#663399',
        red: '#ff0000',
        rosybrown: '#bc8f8f',
        royalblue: '#4169e1',
        saddlebrown: '#8b4513',
        salmon: '#fa8072',
        sandybrown: '#f4a460',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        sienna: '#a0522d',
        silver: '#c0c0c0',
        skyblue: '#87ceeb',
        slateblue: '#6a5acd',
        slategray: '#708090',
        slategrey: '#708090',
        snow: '#fffafa',
        springgreen: '#00ff7f',
        steelblue: '#4682b4',
        tan: '#d2b48c',
        teal: '#008080',
        thistle: '#d8bfd8',
        tomato: '#ff6347',
        turquoise: '#40e0d0',
        violet: '#ee82ee',
        wheat: '#f5deb3',
        white: '#ffffff',
        whitesmoke: '#f5f5f5',
        yellow: '#ffff00',
        yellowgreen: '#9acd32'
    };

    var w3cx11_1 = w3cx11;

    var type$b = utils.type;





    Color_1.prototype.name = function() {
        var hex = rgb2hex_1(this._rgb, 'rgb');
        for (var i = 0, list = Object.keys(w3cx11_1); i < list.length; i += 1) {
            var n = list[i];

            if (w3cx11_1[n] === hex) { return n.toLowerCase(); }
        }
        return hex;
    };

    input.format.named = function (name) {
        name = name.toLowerCase();
        if (w3cx11_1[name]) { return hex2rgb_1(w3cx11_1[name]); }
        throw new Error('unknown color name: '+name);
    };

    input.autodetect.push({
        p: 5,
        test: function (h) {
            var rest = [], len = arguments.length - 1;
            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

            if (!rest.length && type$b(h) === 'string' && w3cx11_1[h.toLowerCase()]) {
                return 'named';
            }
        }
    });

    var unpack$t = utils.unpack;

    var rgb2num = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$t(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        return (r << 16) + (g << 8) + b;
    };

    var rgb2num_1 = rgb2num;

    var type$c = utils.type;

    var num2rgb = function (num) {
        if (type$c(num) == "number" && num >= 0 && num <= 0xFFFFFF) {
            var r = num >> 16;
            var g = (num >> 8) & 0xFF;
            var b = num & 0xFF;
            return [r,g,b,1];
        }
        throw new Error("unknown num color: "+num);
    };

    var num2rgb_1 = num2rgb;

    var type$d = utils.type;



    Color_1.prototype.num = function() {
        return rgb2num_1(this._rgb);
    };

    chroma_1.num = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['num']) ));
    };

    input.format.num = num2rgb_1;

    input.autodetect.push({
        p: 5,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            if (args.length === 1 && type$d(args[0]) === 'number' && args[0] >= 0 && args[0] <= 0xFFFFFF) {
                return 'num';
            }
        }
    });

    var unpack$u = utils.unpack;
    var type$e = utils.type;
    var round$5 = Math.round;

    Color_1.prototype.rgb = function(rnd) {
        if ( rnd === void 0 ) rnd=true;

        if (rnd === false) { return this._rgb.slice(0,3); }
        return this._rgb.slice(0,3).map(round$5);
    };

    Color_1.prototype.rgba = function(rnd) {
        if ( rnd === void 0 ) rnd=true;

        return this._rgb.slice(0,4).map(function (v,i) {
            return i<3 ? (rnd === false ? v : round$5(v)) : v;
        });
    };

    chroma_1.rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['rgb']) ));
    };

    input.format.rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgba = unpack$u(args, 'rgba');
        if (rgba[3] === undefined) { rgba[3] = 1; }
        return rgba;
    };

    input.autodetect.push({
        p: 3,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$u(args, 'rgba');
            if (type$e(args) === 'array' && (args.length === 3 ||
                args.length === 4 && type$e(args[3]) == 'number' && args[3] >= 0 && args[3] <= 1)) {
                return 'rgb';
            }
        }
    });

    /*
     * Based on implementation by Neil Bartlett
     * https://github.com/neilbartlett/color-temperature
     */

    var log = Math.log;

    var temperature2rgb = function (kelvin) {
        var temp = kelvin / 100;
        var r,g,b;
        if (temp < 66) {
            r = 255;
            g = -155.25485562709179 - 0.44596950469579133 * (g = temp-2) + 104.49216199393888 * log(g);
            b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp-10) + 115.67994401066147 * log(b);
        } else {
            r = 351.97690566805693 + 0.114206453784165 * (r = temp-55) - 40.25366309332127 * log(r);
            g = 325.4494125711974 + 0.07943456536662342 * (g = temp-50) - 28.0852963507957 * log(g);
            b = 255;
        }
        return [r,g,b,1];
    };

    var temperature2rgb_1 = temperature2rgb;

    /*
     * Based on implementation by Neil Bartlett
     * https://github.com/neilbartlett/color-temperature
     **/


    var unpack$v = utils.unpack;
    var round$6 = Math.round;

    var rgb2temperature = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgb = unpack$v(args, 'rgb');
        var r = rgb[0], b = rgb[2];
        var minTemp = 1000;
        var maxTemp = 40000;
        var eps = 0.4;
        var temp;
        while (maxTemp - minTemp > eps) {
            temp = (maxTemp + minTemp) * 0.5;
            var rgb$1 = temperature2rgb_1(temp);
            if ((rgb$1[2] / rgb$1[0]) >= (b / r)) {
                maxTemp = temp;
            } else {
                minTemp = temp;
            }
        }
        return round$6(temp);
    };

    var rgb2temperature_1 = rgb2temperature;

    Color_1.prototype.temp =
    Color_1.prototype.kelvin =
    Color_1.prototype.temperature = function() {
        return rgb2temperature_1(this._rgb);
    };

    chroma_1.temp =
    chroma_1.kelvin =
    chroma_1.temperature = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['temp']) ));
    };

    input.format.temp =
    input.format.kelvin =
    input.format.temperature = temperature2rgb_1;

    var type$f = utils.type;

    Color_1.prototype.alpha = function(a, mutate) {
        if ( mutate === void 0 ) mutate=false;

        if (a !== undefined && type$f(a) === 'number') {
            if (mutate) {
                this._rgb[3] = a;
                return this;
            }
            return new Color_1([this._rgb[0], this._rgb[1], this._rgb[2], a], 'rgb');
        }
        return this._rgb[3];
    };

    Color_1.prototype.clipped = function() {
        return this._rgb._clipped || false;
    };

    Color_1.prototype.darken = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	var me = this;
    	var lab = me.lab();
    	lab[0] -= labConstants.Kn * amount;
    	return new Color_1(lab, 'lab').alpha(me.alpha(), true);
    };

    Color_1.prototype.brighten = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	return this.darken(-amount);
    };

    Color_1.prototype.darker = Color_1.prototype.darken;
    Color_1.prototype.brighter = Color_1.prototype.brighten;

    Color_1.prototype.get = function(mc) {
        var ref = mc.split('.');
        var mode = ref[0];
        var channel = ref[1];
        var src = this[mode]();
        if (channel) {
            var i = mode.indexOf(channel);
            if (i > -1) { return src[i]; }
            throw new Error(("unknown channel " + channel + " in mode " + mode));
        } else {
            return src;
        }
    };

    var type$g = utils.type;
    var pow$2 = Math.pow;

    var EPS = 1e-7;
    var MAX_ITER = 20;

    Color_1.prototype.luminance = function(lum) {
        if (lum !== undefined && type$g(lum) === 'number') {
            if (lum === 0) {
                // return pure black
                return new Color_1([0,0,0,this._rgb[3]], 'rgb');
            }
            if (lum === 1) {
                // return pure white
                return new Color_1([255,255,255,this._rgb[3]], 'rgb');
            }
            // compute new color using...
            var cur_lum = this.luminance();
            var mode = 'rgb';
            var max_iter = MAX_ITER;

            var test = function (low, high) {
                var mid = low.interpolate(high, 0.5, mode);
                var lm = mid.luminance();
                if (Math.abs(lum - lm) < EPS || !max_iter--) {
                    // close enough
                    return mid;
                }
                return lm > lum ? test(low, mid) : test(mid, high);
            };

            var rgb = (cur_lum > lum ? test(new Color_1([0,0,0]), this) : test(this, new Color_1([255,255,255]))).rgb();
            return new Color_1(rgb.concat( [this._rgb[3]]));
        }
        return rgb2luminance.apply(void 0, (this._rgb).slice(0,3));
    };


    var rgb2luminance = function (r,g,b) {
        // relative luminance
        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
        r = luminance_x(r);
        g = luminance_x(g);
        b = luminance_x(b);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    var luminance_x = function (x) {
        x /= 255;
        return x <= 0.03928 ? x/12.92 : pow$2((x+0.055)/1.055, 2.4);
    };

    var interpolator = {};

    var type$h = utils.type;


    var mix = function (col1, col2, f) {
        if ( f === void 0 ) f=0.5;
        var rest = [], len = arguments.length - 3;
        while ( len-- > 0 ) rest[ len ] = arguments[ len + 3 ];

        var mode = rest[0] || 'lrgb';
        if (!interpolator[mode] && !rest.length) {
            // fall back to the first supported mode
            mode = Object.keys(interpolator)[0];
        }
        if (!interpolator[mode]) {
            throw new Error(("interpolation mode " + mode + " is not defined"));
        }
        if (type$h(col1) !== 'object') { col1 = new Color_1(col1); }
        if (type$h(col2) !== 'object') { col2 = new Color_1(col2); }
        return interpolator[mode](col1, col2, f)
            .alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
    };

    Color_1.prototype.mix =
    Color_1.prototype.interpolate = function(col2, f) {
    	if ( f === void 0 ) f=0.5;
    	var rest = [], len = arguments.length - 2;
    	while ( len-- > 0 ) rest[ len ] = arguments[ len + 2 ];

    	return mix.apply(void 0, [ this, col2, f ].concat( rest ));
    };

    Color_1.prototype.premultiply = function(mutate) {
    	if ( mutate === void 0 ) mutate=false;

    	var rgb = this._rgb;
    	var a = rgb[3];
    	if (mutate) {
    		this._rgb = [rgb[0]*a, rgb[1]*a, rgb[2]*a, a];
    		return this;
    	} else {
    		return new Color_1([rgb[0]*a, rgb[1]*a, rgb[2]*a, a], 'rgb');
    	}
    };

    Color_1.prototype.saturate = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	var me = this;
    	var lch = me.lch();
    	lch[1] += labConstants.Kn * amount;
    	if (lch[1] < 0) { lch[1] = 0; }
    	return new Color_1(lch, 'lch').alpha(me.alpha(), true);
    };

    Color_1.prototype.desaturate = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	return this.saturate(-amount);
    };

    var type$i = utils.type;

    Color_1.prototype.set = function(mc, value, mutate) {
        if ( mutate === void 0 ) mutate=false;

        var ref = mc.split('.');
        var mode = ref[0];
        var channel = ref[1];
        var src = this[mode]();
        if (channel) {
            var i = mode.indexOf(channel);
            if (i > -1) {
                if (type$i(value) == 'string') {
                    switch(value.charAt(0)) {
                        case '+': src[i] += +value; break;
                        case '-': src[i] += +value; break;
                        case '*': src[i] *= +(value.substr(1)); break;
                        case '/': src[i] /= +(value.substr(1)); break;
                        default: src[i] = +value;
                    }
                } else if (type$i(value) === 'number') {
                    src[i] = value;
                } else {
                    throw new Error("unsupported value for Color.set");
                }
                var out = new Color_1(src, mode);
                if (mutate) {
                    this._rgb = out._rgb;
                    return this;
                }
                return out;
            }
            throw new Error(("unknown channel " + channel + " in mode " + mode));
        } else {
            return src;
        }
    };

    var rgb$1 = function (col1, col2, f) {
        var xyz0 = col1._rgb;
        var xyz1 = col2._rgb;
        return new Color_1(
            xyz0[0] + f * (xyz1[0]-xyz0[0]),
            xyz0[1] + f * (xyz1[1]-xyz0[1]),
            xyz0[2] + f * (xyz1[2]-xyz0[2]),
            'rgb'
        )
    };

    // register interpolator
    interpolator.rgb = rgb$1;

    var sqrt$2 = Math.sqrt;
    var pow$3 = Math.pow;

    var lrgb = function (col1, col2, f) {
        var ref = col1._rgb;
        var x1 = ref[0];
        var y1 = ref[1];
        var z1 = ref[2];
        var ref$1 = col2._rgb;
        var x2 = ref$1[0];
        var y2 = ref$1[1];
        var z2 = ref$1[2];
        return new Color_1(
            sqrt$2(pow$3(x1,2) * (1-f) + pow$3(x2,2) * f),
            sqrt$2(pow$3(y1,2) * (1-f) + pow$3(y2,2) * f),
            sqrt$2(pow$3(z1,2) * (1-f) + pow$3(z2,2) * f),
            'rgb'
        )
    };

    // register interpolator
    interpolator.lrgb = lrgb;

    var lab$1 = function (col1, col2, f) {
        var xyz0 = col1.lab();
        var xyz1 = col2.lab();
        return new Color_1(
            xyz0[0] + f * (xyz1[0]-xyz0[0]),
            xyz0[1] + f * (xyz1[1]-xyz0[1]),
            xyz0[2] + f * (xyz1[2]-xyz0[2]),
            'lab'
        )
    };

    // register interpolator
    interpolator.lab = lab$1;

    var _hsx = function (col1, col2, f, m) {
        var assign, assign$1;

        var xyz0, xyz1;
        if (m === 'hsl') {
            xyz0 = col1.hsl();
            xyz1 = col2.hsl();
        } else if (m === 'hsv') {
            xyz0 = col1.hsv();
            xyz1 = col2.hsv();
        } else if (m === 'hcg') {
            xyz0 = col1.hcg();
            xyz1 = col2.hcg();
        } else if (m === 'hsi') {
            xyz0 = col1.hsi();
            xyz1 = col2.hsi();
        } else if (m === 'lch' || m === 'hcl') {
            m = 'hcl';
            xyz0 = col1.hcl();
            xyz1 = col2.hcl();
        }

        var hue0, hue1, sat0, sat1, lbv0, lbv1;
        if (m.substr(0, 1) === 'h') {
            (assign = xyz0, hue0 = assign[0], sat0 = assign[1], lbv0 = assign[2]);
            (assign$1 = xyz1, hue1 = assign$1[0], sat1 = assign$1[1], lbv1 = assign$1[2]);
        }

        var sat, hue, lbv, dh;

        if (!isNaN(hue0) && !isNaN(hue1)) {
            // both colors have hue
            if (hue1 > hue0 && hue1 - hue0 > 180) {
                dh = hue1-(hue0+360);
            } else if (hue1 < hue0 && hue0 - hue1 > 180) {
                dh = hue1+360-hue0;
            } else {
                dh = hue1 - hue0;
            }
            hue = hue0 + f * dh;
        } else if (!isNaN(hue0)) {
            hue = hue0;
            if ((lbv1 == 1 || lbv1 == 0) && m != 'hsv') { sat = sat0; }
        } else if (!isNaN(hue1)) {
            hue = hue1;
            if ((lbv0 == 1 || lbv0 == 0) && m != 'hsv') { sat = sat1; }
        } else {
            hue = Number.NaN;
        }

        if (sat === undefined) { sat = sat0 + f * (sat1 - sat0); }
        lbv = lbv0 + f * (lbv1-lbv0);
        return new Color_1([hue, sat, lbv], m);
    };

    var lch$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'lch');
    };

    // register interpolator
    interpolator.lch = lch$1;
    interpolator.hcl = lch$1;

    var num$1 = function (col1, col2, f) {
        var c1 = col1.num();
        var c2 = col2.num();
        return new Color_1(c1 + f * (c2-c1), 'num')
    };

    // register interpolator
    interpolator.num = num$1;

    var hcg$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hcg');
    };

    // register interpolator
    interpolator.hcg = hcg$1;

    var hsi$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hsi');
    };

    // register interpolator
    interpolator.hsi = hsi$1;

    var hsl$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hsl');
    };

    // register interpolator
    interpolator.hsl = hsl$1;

    var hsv$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hsv');
    };

    // register interpolator
    interpolator.hsv = hsv$1;

    var clip_rgb$2 = utils.clip_rgb;
    var pow$4 = Math.pow;
    var sqrt$3 = Math.sqrt;
    var PI$1 = Math.PI;
    var cos$2 = Math.cos;
    var sin$1 = Math.sin;
    var atan2$1 = Math.atan2;

    var average = function (colors, mode, weights) {
        if ( mode === void 0 ) mode='lrgb';
        if ( weights === void 0 ) weights=null;

        var l = colors.length;
        if (!weights) { weights = Array.from(new Array(l)).map(function () { return 1; }); }
        // normalize weights
        var k = l / weights.reduce(function(a, b) { return a + b; });
        weights.forEach(function (w,i) { weights[i] *= k; });
        // convert colors to Color objects
        colors = colors.map(function (c) { return new Color_1(c); });
        if (mode === 'lrgb') {
            return _average_lrgb(colors, weights)
        }
        var first = colors.shift();
        var xyz = first.get(mode);
        var cnt = [];
        var dx = 0;
        var dy = 0;
        // initial color
        for (var i=0; i<xyz.length; i++) {
            xyz[i] = (xyz[i] || 0) * weights[0];
            cnt.push(isNaN(xyz[i]) ? 0 : weights[0]);
            if (mode.charAt(i) === 'h' && !isNaN(xyz[i])) {
                var A = xyz[i] / 180 * PI$1;
                dx += cos$2(A) * weights[0];
                dy += sin$1(A) * weights[0];
            }
        }

        var alpha = first.alpha() * weights[0];
        colors.forEach(function (c,ci) {
            var xyz2 = c.get(mode);
            alpha += c.alpha() * weights[ci+1];
            for (var i=0; i<xyz.length; i++) {
                if (!isNaN(xyz2[i])) {
                    cnt[i] += weights[ci+1];
                    if (mode.charAt(i) === 'h') {
                        var A = xyz2[i] / 180 * PI$1;
                        dx += cos$2(A) * weights[ci+1];
                        dy += sin$1(A) * weights[ci+1];
                    } else {
                        xyz[i] += xyz2[i] * weights[ci+1];
                    }
                }
            }
        });

        for (var i$1=0; i$1<xyz.length; i$1++) {
            if (mode.charAt(i$1) === 'h') {
                var A$1 = atan2$1(dy / cnt[i$1], dx / cnt[i$1]) / PI$1 * 180;
                while (A$1 < 0) { A$1 += 360; }
                while (A$1 >= 360) { A$1 -= 360; }
                xyz[i$1] = A$1;
            } else {
                xyz[i$1] = xyz[i$1]/cnt[i$1];
            }
        }
        alpha /= l;
        return (new Color_1(xyz, mode)).alpha(alpha > 0.99999 ? 1 : alpha, true);
    };


    var _average_lrgb = function (colors, weights) {
        var l = colors.length;
        var xyz = [0,0,0,0];
        for (var i=0; i < colors.length; i++) {
            var col = colors[i];
            var f = weights[i] / l;
            var rgb = col._rgb;
            xyz[0] += pow$4(rgb[0],2) * f;
            xyz[1] += pow$4(rgb[1],2) * f;
            xyz[2] += pow$4(rgb[2],2) * f;
            xyz[3] += rgb[3] * f;
        }
        xyz[0] = sqrt$3(xyz[0]);
        xyz[1] = sqrt$3(xyz[1]);
        xyz[2] = sqrt$3(xyz[2]);
        if (xyz[3] > 0.9999999) { xyz[3] = 1; }
        return new Color_1(clip_rgb$2(xyz));
    };

    // minimal multi-purpose interface

    // @requires utils color analyze


    var type$j = utils.type;

    var pow$5 = Math.pow;

    var scale = function(colors) {

        // constructor
        var _mode = 'rgb';
        var _nacol = chroma_1('#ccc');
        var _spread = 0;
        // const _fixed = false;
        var _domain = [0, 1];
        var _pos = [];
        var _padding = [0,0];
        var _classes = false;
        var _colors = [];
        var _out = false;
        var _min = 0;
        var _max = 1;
        var _correctLightness = false;
        var _colorCache = {};
        var _useCache = true;
        var _gamma = 1;

        // private methods

        var setColors = function(colors) {
            colors = colors || ['#fff', '#000'];
            if (colors && type$j(colors) === 'string' && chroma_1.brewer &&
                chroma_1.brewer[colors.toLowerCase()]) {
                colors = chroma_1.brewer[colors.toLowerCase()];
            }
            if (type$j(colors) === 'array') {
                // handle single color
                if (colors.length === 1) {
                    colors = [colors[0], colors[0]];
                }
                // make a copy of the colors
                colors = colors.slice(0);
                // convert to chroma classes
                for (var c=0; c<colors.length; c++) {
                    colors[c] = chroma_1(colors[c]);
                }
                // auto-fill color position
                _pos.length = 0;
                for (var c$1=0; c$1<colors.length; c$1++) {
                    _pos.push(c$1/(colors.length-1));
                }
            }
            resetCache();
            return _colors = colors;
        };

        var getClass = function(value) {
            if (_classes != null) {
                var n = _classes.length-1;
                var i = 0;
                while (i < n && value >= _classes[i]) {
                    i++;
                }
                return i-1;
            }
            return 0;
        };

        var tMapLightness = function (t) { return t; };
        var tMapDomain = function (t) { return t; };

        // const classifyValue = function(value) {
        //     let val = value;
        //     if (_classes.length > 2) {
        //         const n = _classes.length-1;
        //         const i = getClass(value);
        //         const minc = _classes[0] + ((_classes[1]-_classes[0]) * (0 + (_spread * 0.5)));  // center of 1st class
        //         const maxc = _classes[n-1] + ((_classes[n]-_classes[n-1]) * (1 - (_spread * 0.5)));  // center of last class
        //         val = _min + ((((_classes[i] + ((_classes[i+1] - _classes[i]) * 0.5)) - minc) / (maxc-minc)) * (_max - _min));
        //     }
        //     return val;
        // };

        var getColor = function(val, bypassMap) {
            var col, t;
            if (bypassMap == null) { bypassMap = false; }
            if (isNaN(val) || (val === null)) { return _nacol; }
            if (!bypassMap) {
                if (_classes && (_classes.length > 2)) {
                    // find the class
                    var c = getClass(val);
                    t = c / (_classes.length-2);
                } else if (_max !== _min) {
                    // just interpolate between min/max
                    t = (val - _min) / (_max - _min);
                } else {
                    t = 1;
                }
            } else {
                t = val;
            }

            // domain map
            t = tMapDomain(t);

            if (!bypassMap) {
                t = tMapLightness(t);  // lightness correction
            }

            if (_gamma !== 1) { t = pow$5(t, _gamma); }

            t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));

            t = Math.min(1, Math.max(0, t));

            var k = Math.floor(t * 10000);

            if (_useCache && _colorCache[k]) {
                col = _colorCache[k];
            } else {
                if (type$j(_colors) === 'array') {
                    //for i in [0.._pos.length-1]
                    for (var i=0; i<_pos.length; i++) {
                        var p = _pos[i];
                        if (t <= p) {
                            col = _colors[i];
                            break;
                        }
                        if ((t >= p) && (i === (_pos.length-1))) {
                            col = _colors[i];
                            break;
                        }
                        if (t > p && t < _pos[i+1]) {
                            t = (t-p)/(_pos[i+1]-p);
                            col = chroma_1.interpolate(_colors[i], _colors[i+1], t, _mode);
                            break;
                        }
                    }
                } else if (type$j(_colors) === 'function') {
                    col = _colors(t);
                }
                if (_useCache) { _colorCache[k] = col; }
            }
            return col;
        };

        var resetCache = function () { return _colorCache = {}; };

        setColors(colors);

        // public interface

        var f = function(v) {
            var c = chroma_1(getColor(v));
            if (_out && c[_out]) { return c[_out](); } else { return c; }
        };

        f.classes = function(classes) {
            if (classes != null) {
                if (type$j(classes) === 'array') {
                    _classes = classes;
                    _domain = [classes[0], classes[classes.length-1]];
                } else {
                    var d = chroma_1.analyze(_domain);
                    if (classes === 0) {
                        _classes = [d.min, d.max];
                    } else {
                        _classes = chroma_1.limits(d, 'e', classes);
                    }
                }
                return f;
            }
            return _classes;
        };


        f.domain = function(domain) {
            if (!arguments.length) {
                return _domain;
            }
            _min = domain[0];
            _max = domain[domain.length-1];
            _pos = [];
            var k = _colors.length;
            if ((domain.length === k) && (_min !== _max)) {
                // update positions
                for (var i = 0, list = Array.from(domain); i < list.length; i += 1) {
                    var d = list[i];

                  _pos.push((d-_min) / (_max-_min));
                }
            } else {
                for (var c=0; c<k; c++) {
                    _pos.push(c/(k-1));
                }
                if (domain.length > 2) {
                    // set domain map
                    var tOut = domain.map(function (d,i) { return i/(domain.length-1); });
                    var tBreaks = domain.map(function (d) { return (d - _min) / (_max - _min); });
                    if (!tBreaks.every(function (val, i) { return tOut[i] === val; })) {
                        tMapDomain = function (t) {
                            if (t <= 0 || t >= 1) { return t; }
                            var i = 0;
                            while (t >= tBreaks[i+1]) { i++; }
                            var f = (t - tBreaks[i]) / (tBreaks[i+1] - tBreaks[i]);
                            var out = tOut[i] + f * (tOut[i+1] - tOut[i]);
                            return out;
                        };
                    }

                }
            }
            _domain = [_min, _max];
            return f;
        };

        f.mode = function(_m) {
            if (!arguments.length) {
                return _mode;
            }
            _mode = _m;
            resetCache();
            return f;
        };

        f.range = function(colors, _pos) {
            setColors(colors);
            return f;
        };

        f.out = function(_o) {
            _out = _o;
            return f;
        };

        f.spread = function(val) {
            if (!arguments.length) {
                return _spread;
            }
            _spread = val;
            return f;
        };

        f.correctLightness = function(v) {
            if (v == null) { v = true; }
            _correctLightness = v;
            resetCache();
            if (_correctLightness) {
                tMapLightness = function(t) {
                    var L0 = getColor(0, true).lab()[0];
                    var L1 = getColor(1, true).lab()[0];
                    var pol = L0 > L1;
                    var L_actual = getColor(t, true).lab()[0];
                    var L_ideal = L0 + ((L1 - L0) * t);
                    var L_diff = L_actual - L_ideal;
                    var t0 = 0;
                    var t1 = 1;
                    var max_iter = 20;
                    while ((Math.abs(L_diff) > 1e-2) && (max_iter-- > 0)) {
                        (function() {
                            if (pol) { L_diff *= -1; }
                            if (L_diff < 0) {
                                t0 = t;
                                t += (t1 - t) * 0.5;
                            } else {
                                t1 = t;
                                t += (t0 - t) * 0.5;
                            }
                            L_actual = getColor(t, true).lab()[0];
                            return L_diff = L_actual - L_ideal;
                        })();
                    }
                    return t;
                };
            } else {
                tMapLightness = function (t) { return t; };
            }
            return f;
        };

        f.padding = function(p) {
            if (p != null) {
                if (type$j(p) === 'number') {
                    p = [p,p];
                }
                _padding = p;
                return f;
            } else {
                return _padding;
            }
        };

        f.colors = function(numColors, out) {
            // If no arguments are given, return the original colors that were provided
            if (arguments.length < 2) { out = 'hex'; }
            var result = [];

            if (arguments.length === 0) {
                result = _colors.slice(0);

            } else if (numColors === 1) {
                result = [f(0.5)];

            } else if (numColors > 1) {
                var dm = _domain[0];
                var dd = _domain[1] - dm;
                result = __range__(0, numColors, false).map(function (i) { return f( dm + ((i/(numColors-1)) * dd) ); });

            } else { // returns all colors based on the defined classes
                colors = [];
                var samples = [];
                if (_classes && (_classes.length > 2)) {
                    for (var i = 1, end = _classes.length, asc = 1 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                        samples.push((_classes[i-1]+_classes[i])*0.5);
                    }
                } else {
                    samples = _domain;
                }
                result = samples.map(function (v) { return f(v); });
            }

            if (chroma_1[out]) {
                result = result.map(function (c) { return c[out](); });
            }
            return result;
        };

        f.cache = function(c) {
            if (c != null) {
                _useCache = c;
                return f;
            } else {
                return _useCache;
            }
        };

        f.gamma = function(g) {
            if (g != null) {
                _gamma = g;
                return f;
            } else {
                return _gamma;
            }
        };

        f.nodata = function(d) {
            if (d != null) {
                _nacol = chroma_1(d);
                return f;
            } else {
                return _nacol;
            }
        };

        return f;
    };

    function __range__(left, right, inclusive) {
      var range = [];
      var ascending = left < right;
      var end = !inclusive ? right : ascending ? right + 1 : right - 1;
      for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
      }
      return range;
    }

    //
    // interpolates between a set of colors uzing a bezier spline
    //

    // @requires utils lab




    var bezier = function(colors) {
        var assign, assign$1, assign$2;

        var I, lab0, lab1, lab2;
        colors = colors.map(function (c) { return new Color_1(c); });
        if (colors.length === 2) {
            // linear interpolation
            (assign = colors.map(function (c) { return c.lab(); }), lab0 = assign[0], lab1 = assign[1]);
            I = function(t) {
                var lab = ([0, 1, 2].map(function (i) { return lab0[i] + (t * (lab1[i] - lab0[i])); }));
                return new Color_1(lab, 'lab');
            };
        } else if (colors.length === 3) {
            // quadratic bezier interpolation
            (assign$1 = colors.map(function (c) { return c.lab(); }), lab0 = assign$1[0], lab1 = assign$1[1], lab2 = assign$1[2]);
            I = function(t) {
                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t) * lab0[i]) + (2 * (1-t) * t * lab1[i]) + (t * t * lab2[i]); }));
                return new Color_1(lab, 'lab');
            };
        } else if (colors.length === 4) {
            // cubic bezier interpolation
            var lab3;
            (assign$2 = colors.map(function (c) { return c.lab(); }), lab0 = assign$2[0], lab1 = assign$2[1], lab2 = assign$2[2], lab3 = assign$2[3]);
            I = function(t) {
                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t)*(1-t) * lab0[i]) + (3 * (1-t) * (1-t) * t * lab1[i]) + (3 * (1-t) * t * t * lab2[i]) + (t*t*t * lab3[i]); }));
                return new Color_1(lab, 'lab');
            };
        } else if (colors.length === 5) {
            var I0 = bezier(colors.slice(0, 3));
            var I1 = bezier(colors.slice(2, 5));
            I = function(t) {
                if (t < 0.5) {
                    return I0(t*2);
                } else {
                    return I1((t-0.5)*2);
                }
            };
        }
        return I;
    };

    var bezier_1 = function (colors) {
        var f = bezier(colors);
        f.scale = function () { return scale(f); };
        return f;
    };

    /*
     * interpolates between a set of colors uzing a bezier spline
     * blend mode formulas taken from http://www.venture-ware.com/kevin/coding/lets-learn-math-photoshop-blend-modes/
     */




    var blend = function (bottom, top, mode) {
        if (!blend[mode]) {
            throw new Error('unknown blend mode ' + mode);
        }
        return blend[mode](bottom, top);
    };

    var blend_f = function (f) { return function (bottom,top) {
            var c0 = chroma_1(top).rgb();
            var c1 = chroma_1(bottom).rgb();
            return chroma_1.rgb(f(c0, c1));
        }; };

    var each = function (f) { return function (c0, c1) {
            var out = [];
            out[0] = f(c0[0], c1[0]);
            out[1] = f(c0[1], c1[1]);
            out[2] = f(c0[2], c1[2]);
            return out;
        }; };

    var normal = function (a) { return a; };
    var multiply = function (a,b) { return a * b / 255; };
    var darken$1 = function (a,b) { return a > b ? b : a; };
    var lighten = function (a,b) { return a > b ? a : b; };
    var screen = function (a,b) { return 255 * (1 - (1-a/255) * (1-b/255)); };
    var overlay = function (a,b) { return b < 128 ? 2 * a * b / 255 : 255 * (1 - 2 * (1 - a / 255 ) * ( 1 - b / 255 )); };
    var burn = function (a,b) { return 255 * (1 - (1 - b / 255) / (a/255)); };
    var dodge = function (a,b) {
        if (a === 255) { return 255; }
        a = 255 * (b / 255) / (1 - a / 255);
        return a > 255 ? 255 : a
    };

    // # add = (a,b) ->
    // #     if (a + b > 255) then 255 else a + b

    blend.normal = blend_f(each(normal));
    blend.multiply = blend_f(each(multiply));
    blend.screen = blend_f(each(screen));
    blend.overlay = blend_f(each(overlay));
    blend.darken = blend_f(each(darken$1));
    blend.lighten = blend_f(each(lighten));
    blend.dodge = blend_f(each(dodge));
    blend.burn = blend_f(each(burn));
    // blend.add = blend_f(each(add));

    var blend_1 = blend;

    // cubehelix interpolation
    // based on D.A. Green "A colour scheme for the display of astronomical intensity images"
    // http://astron-soc.in/bulletin/11June/289392011.pdf

    var type$k = utils.type;
    var clip_rgb$3 = utils.clip_rgb;
    var TWOPI$2 = utils.TWOPI;
    var pow$6 = Math.pow;
    var sin$2 = Math.sin;
    var cos$3 = Math.cos;


    var cubehelix = function(start, rotations, hue, gamma, lightness) {
        if ( start === void 0 ) start=300;
        if ( rotations === void 0 ) rotations=-1.5;
        if ( hue === void 0 ) hue=1;
        if ( gamma === void 0 ) gamma=1;
        if ( lightness === void 0 ) lightness=[0,1];

        var dh = 0, dl;
        if (type$k(lightness) === 'array') {
            dl = lightness[1] - lightness[0];
        } else {
            dl = 0;
            lightness = [lightness, lightness];
        }

        var f = function(fract) {
            var a = TWOPI$2 * (((start+120)/360) + (rotations * fract));
            var l = pow$6(lightness[0] + (dl * fract), gamma);
            var h = dh !== 0 ? hue[0] + (fract * dh) : hue;
            var amp = (h * l * (1-l)) / 2;
            var cos_a = cos$3(a);
            var sin_a = sin$2(a);
            var r = l + (amp * ((-0.14861 * cos_a) + (1.78277* sin_a)));
            var g = l + (amp * ((-0.29227 * cos_a) - (0.90649* sin_a)));
            var b = l + (amp * (+1.97294 * cos_a));
            return chroma_1(clip_rgb$3([r*255,g*255,b*255,1]));
        };

        f.start = function(s) {
            if ((s == null)) { return start; }
            start = s;
            return f;
        };

        f.rotations = function(r) {
            if ((r == null)) { return rotations; }
            rotations = r;
            return f;
        };

        f.gamma = function(g) {
            if ((g == null)) { return gamma; }
            gamma = g;
            return f;
        };

        f.hue = function(h) {
            if ((h == null)) { return hue; }
            hue = h;
            if (type$k(hue) === 'array') {
                dh = hue[1] - hue[0];
                if (dh === 0) { hue = hue[1]; }
            } else {
                dh = 0;
            }
            return f;
        };

        f.lightness = function(h) {
            if ((h == null)) { return lightness; }
            if (type$k(h) === 'array') {
                lightness = h;
                dl = h[1] - h[0];
            } else {
                lightness = [h,h];
                dl = 0;
            }
            return f;
        };

        f.scale = function () { return chroma_1.scale(f); };

        f.hue(hue);

        return f;
    };

    var digits = '0123456789abcdef';

    var floor$2 = Math.floor;
    var random = Math.random;

    var random_1 = function () {
        var code = '#';
        for (var i=0; i<6; i++) {
            code += digits.charAt(floor$2(random() * 16));
        }
        return new Color_1(code, 'hex');
    };

    var log$1 = Math.log;
    var pow$7 = Math.pow;
    var floor$3 = Math.floor;
    var abs = Math.abs;


    var analyze = function (data, key) {
        if ( key === void 0 ) key=null;

        var r = {
            min: Number.MAX_VALUE,
            max: Number.MAX_VALUE*-1,
            sum: 0,
            values: [],
            count: 0
        };
        if (type(data) === 'object') {
            data = Object.values(data);
        }
        data.forEach(function (val) {
            if (key && type(val) === 'object') { val = val[key]; }
            if (val !== undefined && val !== null && !isNaN(val)) {
                r.values.push(val);
                r.sum += val;
                if (val < r.min) { r.min = val; }
                if (val > r.max) { r.max = val; }
                r.count += 1;
            }
        });

        r.domain = [r.min, r.max];

        r.limits = function (mode, num) { return limits(r, mode, num); };

        return r;
    };


    var limits = function (data, mode, num) {
        if ( mode === void 0 ) mode='equal';
        if ( num === void 0 ) num=7;

        if (type(data) == 'array') {
            data = analyze(data);
        }
        var min = data.min;
        var max = data.max;
        var values = data.values.sort(function (a,b) { return a-b; });

        if (num === 1) { return [min,max]; }

        var limits = [];

        if (mode.substr(0,1) === 'c') { // continuous
            limits.push(min);
            limits.push(max);
        }

        if (mode.substr(0,1) === 'e') { // equal interval
            limits.push(min);
            for (var i=1; i<num; i++) {
                limits.push(min+((i/num)*(max-min)));
            }
            limits.push(max);
        }

        else if (mode.substr(0,1) === 'l') { // log scale
            if (min <= 0) {
                throw new Error('Logarithmic scales are only possible for values > 0');
            }
            var min_log = Math.LOG10E * log$1(min);
            var max_log = Math.LOG10E * log$1(max);
            limits.push(min);
            for (var i$1=1; i$1<num; i$1++) {
                limits.push(pow$7(10, min_log + ((i$1/num) * (max_log - min_log))));
            }
            limits.push(max);
        }

        else if (mode.substr(0,1) === 'q') { // quantile scale
            limits.push(min);
            for (var i$2=1; i$2<num; i$2++) {
                var p = ((values.length-1) * i$2)/num;
                var pb = floor$3(p);
                if (pb === p) {
                    limits.push(values[pb]);
                } else { // p > pb
                    var pr = p - pb;
                    limits.push((values[pb]*(1-pr)) + (values[pb+1]*pr));
                }
            }
            limits.push(max);

        }

        else if (mode.substr(0,1) === 'k') { // k-means clustering
            /*
            implementation based on
            http://code.google.com/p/figue/source/browse/trunk/figue.js#336
            simplified for 1-d input values
            */
            var cluster;
            var n = values.length;
            var assignments = new Array(n);
            var clusterSizes = new Array(num);
            var repeat = true;
            var nb_iters = 0;
            var centroids = null;

            // get seed values
            centroids = [];
            centroids.push(min);
            for (var i$3=1; i$3<num; i$3++) {
                centroids.push(min + ((i$3/num) * (max-min)));
            }
            centroids.push(max);

            while (repeat) {
                // assignment step
                for (var j=0; j<num; j++) {
                    clusterSizes[j] = 0;
                }
                for (var i$4=0; i$4<n; i$4++) {
                    var value = values[i$4];
                    var mindist = Number.MAX_VALUE;
                    var best = (void 0);
                    for (var j$1=0; j$1<num; j$1++) {
                        var dist = abs(centroids[j$1]-value);
                        if (dist < mindist) {
                            mindist = dist;
                            best = j$1;
                        }
                        clusterSizes[best]++;
                        assignments[i$4] = best;
                    }
                }

                // update centroids step
                var newCentroids = new Array(num);
                for (var j$2=0; j$2<num; j$2++) {
                    newCentroids[j$2] = null;
                }
                for (var i$5=0; i$5<n; i$5++) {
                    cluster = assignments[i$5];
                    if (newCentroids[cluster] === null) {
                        newCentroids[cluster] = values[i$5];
                    } else {
                        newCentroids[cluster] += values[i$5];
                    }
                }
                for (var j$3=0; j$3<num; j$3++) {
                    newCentroids[j$3] *= 1/clusterSizes[j$3];
                }

                // check convergence
                repeat = false;
                for (var j$4=0; j$4<num; j$4++) {
                    if (newCentroids[j$4] !== centroids[j$4]) {
                        repeat = true;
                        break;
                    }
                }

                centroids = newCentroids;
                nb_iters++;

                if (nb_iters > 200) {
                    repeat = false;
                }
            }

            // finished k-means clustering
            // the next part is borrowed from gabrielflor.it
            var kClusters = {};
            for (var j$5=0; j$5<num; j$5++) {
                kClusters[j$5] = [];
            }
            for (var i$6=0; i$6<n; i$6++) {
                cluster = assignments[i$6];
                kClusters[cluster].push(values[i$6]);
            }
            var tmpKMeansBreaks = [];
            for (var j$6=0; j$6<num; j$6++) {
                tmpKMeansBreaks.push(kClusters[j$6][0]);
                tmpKMeansBreaks.push(kClusters[j$6][kClusters[j$6].length-1]);
            }
            tmpKMeansBreaks = tmpKMeansBreaks.sort(function (a,b){ return a-b; });
            limits.push(tmpKMeansBreaks[0]);
            for (var i$7=1; i$7 < tmpKMeansBreaks.length; i$7+= 2) {
                var v = tmpKMeansBreaks[i$7];
                if (!isNaN(v) && (limits.indexOf(v) === -1)) {
                    limits.push(v);
                }
            }
        }
        return limits;
    };

    var analyze_1 = {analyze: analyze, limits: limits};

    var contrast = function (a, b) {
        // WCAG contrast ratio
        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
        a = new Color_1(a);
        b = new Color_1(b);
        var l1 = a.luminance();
        var l2 = b.luminance();
        return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
    };

    var sqrt$4 = Math.sqrt;
    var atan2$2 = Math.atan2;
    var abs$1 = Math.abs;
    var cos$4 = Math.cos;
    var PI$2 = Math.PI;

    var deltaE = function(a, b, L, C) {
        if ( L === void 0 ) L=1;
        if ( C === void 0 ) C=1;

        // Delta E (CMC)
        // see http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CMC.html
        a = new Color_1(a);
        b = new Color_1(b);
        var ref = Array.from(a.lab());
        var L1 = ref[0];
        var a1 = ref[1];
        var b1 = ref[2];
        var ref$1 = Array.from(b.lab());
        var L2 = ref$1[0];
        var a2 = ref$1[1];
        var b2 = ref$1[2];
        var c1 = sqrt$4((a1 * a1) + (b1 * b1));
        var c2 = sqrt$4((a2 * a2) + (b2 * b2));
        var sl = L1 < 16.0 ? 0.511 : (0.040975 * L1) / (1.0 + (0.01765 * L1));
        var sc = ((0.0638 * c1) / (1.0 + (0.0131 * c1))) + 0.638;
        var h1 = c1 < 0.000001 ? 0.0 : (atan2$2(b1, a1) * 180.0) / PI$2;
        while (h1 < 0) { h1 += 360; }
        while (h1 >= 360) { h1 -= 360; }
        var t = (h1 >= 164.0) && (h1 <= 345.0) ? (0.56 + abs$1(0.2 * cos$4((PI$2 * (h1 + 168.0)) / 180.0))) : (0.36 + abs$1(0.4 * cos$4((PI$2 * (h1 + 35.0)) / 180.0)));
        var c4 = c1 * c1 * c1 * c1;
        var f = sqrt$4(c4 / (c4 + 1900.0));
        var sh = sc * (((f * t) + 1.0) - f);
        var delL = L1 - L2;
        var delC = c1 - c2;
        var delA = a1 - a2;
        var delB = b1 - b2;
        var dH2 = ((delA * delA) + (delB * delB)) - (delC * delC);
        var v1 = delL / (L * sl);
        var v2 = delC / (C * sc);
        var v3 = sh;
        return sqrt$4((v1 * v1) + (v2 * v2) + (dH2 / (v3 * v3)));
    };

    // simple Euclidean distance
    var distance = function(a, b, mode) {
        if ( mode === void 0 ) mode='lab';

        // Delta E (CIE 1976)
        // see http://www.brucelindbloom.com/index.html?Equations.html
        a = new Color_1(a);
        b = new Color_1(b);
        var l1 = a.get(mode);
        var l2 = b.get(mode);
        var sum_sq = 0;
        for (var i in l1) {
            var d = (l1[i] || 0) - (l2[i] || 0);
            sum_sq += d*d;
        }
        return Math.sqrt(sum_sq);
    };

    var valid = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        try {
            new (Function.prototype.bind.apply( Color_1, [ null ].concat( args) ));
            return true;
        } catch (e) {
            return false;
        }
    };

    // some pre-defined color scales:




    var scales = {
    	cool: function cool() { return scale([chroma_1.hsl(180,1,.9), chroma_1.hsl(250,.7,.4)]) },
    	hot: function hot() { return scale(['#000','#f00','#ff0','#fff']).mode('rgb') }
    };

    /**
        ColorBrewer colors for chroma.js

        Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The
        Pennsylvania State University.

        Licensed under the Apache License, Version 2.0 (the "License");
        you may not use this file except in compliance with the License.
        You may obtain a copy of the License at
        http://www.apache.org/licenses/LICENSE-2.0

        Unless required by applicable law or agreed to in writing, software distributed
        under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
        CONDITIONS OF ANY KIND, either express or implied. See the License for the
        specific language governing permissions and limitations under the License.
    */

    var colorbrewer = {
        // sequential
        OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
        PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
        BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
        Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
        BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
        YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
        YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
        Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
        RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
        Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
        YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
        Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
        GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
        Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
        YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
        PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
        Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
        PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
        Viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],

        // diverging

        Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
        RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
        RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
        PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
        PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
        RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
        BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
        RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
        PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],

        // qualitative

        Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
        Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
        Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
        Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
        Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
        Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
        Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
        Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'],
    };

    // add lowercase aliases for case-insensitive matches
    for (var i$1 = 0, list$1 = Object.keys(colorbrewer); i$1 < list$1.length; i$1 += 1) {
        var key = list$1[i$1];

        colorbrewer[key.toLowerCase()] = colorbrewer[key];
    }

    var colorbrewer_1 = colorbrewer;

    // feel free to comment out anything to rollup
    // a smaller chroma.js built

    // io --> convert colors















    // operators --> modify existing Colors










    // interpolators










    // generators -- > create new colors
    chroma_1.average = average;
    chroma_1.bezier = bezier_1;
    chroma_1.blend = blend_1;
    chroma_1.cubehelix = cubehelix;
    chroma_1.mix = chroma_1.interpolate = mix;
    chroma_1.random = random_1;
    chroma_1.scale = scale;

    // other utility methods
    chroma_1.analyze = analyze_1.analyze;
    chroma_1.contrast = contrast;
    chroma_1.deltaE = deltaE;
    chroma_1.distance = distance;
    chroma_1.limits = analyze_1.limits;
    chroma_1.valid = valid;

    // scale
    chroma_1.scales = scales;

    // colors
    chroma_1.colors = w3cx11_1;
    chroma_1.brewer = colorbrewer_1;

    var chroma_js = chroma_1;

    return chroma_js;

})));
});

function createStyle() {
  const {
    subscribe,
    set,
  } = writable(style({}));

  return {
    subscribe,
    color: (colors) => set(style(colors)),
    reset: () => set(style({}))
  }
}

const theme = createStyle();



/*
 * Available colorBrewer palates:
 *
 *  OrRd,PuBu,BuPu,Oranges,BuGn,YlOrBr,YlGn,Reds,RdPu,Greens,YlGnBu,Purples,GnBu,Greys,
 *  YlOrRd,PuRd,Blues,PuBuGn,Spectral,RdYlGn,RdBu,PiYG,PRGn,RdYlBu,BrBG,RdGy,PuOr,Set2,
 *  Accent,Set1,Set3,Dark2,Paired,Pastel2,Pastel1
 */

function style(colors) {

  let primary = chroma.valid(colors.primary) ? chroma(colors.primary) : chroma('hotpink');
  let secondary = chroma.valid(colors.secondary) ? chroma(colors.secondary) : chroma('#2A4858');
  let tertiary = chroma.valid(colors.tertiary) ? chroma(colors.tertiary) : null;
  let colorList = [primary, secondary];
  if(tertiary){
    colorList.push(tertiary);
  }
  let scale = spread(colorList);

  function palate(name) {
    switch (name) {
      case 'primary':
        return spread(['#222222', primary, '#DDDDDD']);
      case 'secondary':
        return spread(['#222222', secondary, '#DDDDDD']);
      case 'theme':
        return scale;
      case 'helix':
        return chroma.cubehelix().scale().correctLightness().colors(9);
      default:
        return chroma.scale(name).correctLightness().colors(9);
    }
  }

  let theme = {
    primary: primary.css(),
    text: blackOrWhite(primary),
    secondary: secondary.css(),
    secondary_text: blackOrWhite(secondary),
    scale: scale.sort(() => Math.random() - 0.5),
    palate: palate
  };

  return theme;
}

function spread(colors, mode = 'lab') {
  return chroma.scale(colors).mode(mode).colors(9);
}

function brighten(c, v=1){
  let color = chroma(c);
  return color.brighten(v).css();
}

function darken(c, v=1){
  let color = chroma(c);
  return color.darken(v).css();
}

function blackOrWhite(c) {
let color = chroma(c);
  var r = color.get('rgb.r');
  var g = color.get('rgb.g');
  var b = color.get('rgb.b');

  return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ?
    '#000' :
    '#FFF';
}

/* node_modules/sveltefire/src/FirebaseApp.svelte generated by Svelte v3.21.0 */

const { Error: Error_1 } = globals;

// (39:0) {#if ready}
function create_if_block$1(ctx) {
	let current;
	const default_slot_template = /*$$slots*/ ctx[6].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 32) {
					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[5], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$1.name,
		type: "if",
		source: "(39:0) {#if ready}",
		ctx
	});

	return block;
}

function create_fragment$1(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*ready*/ ctx[0] && create_if_block$1(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (/*ready*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*ready*/ 1) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props, $$invalidate) {
	let { firebase } = $$props;
	let { perf = false } = $$props;
	let { analytics = false } = $$props;

	// Ready required to use the app event,
	// prevents child components from running before init
	let ready = false;

	// Emit firebase
	const dispatch = createEventDispatcher();

	// Set firebase context
	firebase = firebase || window.firebase;

	setContext("firebase", firebase);

	onMount(() => {
		if (!firebase) {
			throw Error("No firebase app was provided. You must provide an initialized Firebase app or make it available globally.");
		} else {
			// Init perf and analytics
			perf && firebase.performance();

			analytics && firebase.analytics();

			// Optional event to set additional config
			dispatch("initializeApp", { firebase });

			$$invalidate(0, ready = true);
		}
	});

	const writable_props = ["firebase", "perf", "analytics"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FirebaseApp> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("FirebaseApp", $$slots, ['default']);

	$$self.$set = $$props => {
		if ("firebase" in $$props) $$invalidate(1, firebase = $$props.firebase);
		if ("perf" in $$props) $$invalidate(2, perf = $$props.perf);
		if ("analytics" in $$props) $$invalidate(3, analytics = $$props.analytics);
		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		onMount,
		setContext,
		createEventDispatcher,
		firebase,
		perf,
		analytics,
		ready,
		dispatch
	});

	$$self.$inject_state = $$props => {
		if ("firebase" in $$props) $$invalidate(1, firebase = $$props.firebase);
		if ("perf" in $$props) $$invalidate(2, perf = $$props.perf);
		if ("analytics" in $$props) $$invalidate(3, analytics = $$props.analytics);
		if ("ready" in $$props) $$invalidate(0, ready = $$props.ready);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [ready, firebase, perf, analytics, dispatch, $$scope, $$slots];
}

class FirebaseApp extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { firebase: 1, perf: 2, analytics: 3 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "FirebaseApp",
			options,
			id: create_fragment$1.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*firebase*/ ctx[1] === undefined && !("firebase" in props)) {
			console.warn("<FirebaseApp> was created without expected prop 'firebase'");
		}
	}

	get firebase() {
		throw new Error_1("<FirebaseApp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set firebase(value) {
		throw new Error_1("<FirebaseApp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get perf() {
		throw new Error_1("<FirebaseApp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set perf(value) {
		throw new Error_1("<FirebaseApp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get analytics() {
		throw new Error_1("<FirebaseApp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set analytics(value) {
		throw new Error_1("<FirebaseApp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

function getApp() {
  return getContext('firebase');
}

// Validates end-user has setup context and imported proper modules into the Svelte app
function assertApp(pkg) {

    const app = getApp();

    if (!app) {
      throw new Error(`Missing Firebase app in context. Are you inside a 'FirebaseApp' component?`)
    }

    if (pkg) {
        const pkgFn = app[pkg]; 
        if (!pkgFn || !pkgFn()) {
          throw new Error(`Firebase ${pkg} not found. You may be missing "import 'firebase/${pkg}'" `)
        } else {
          return pkgFn();
        }
    } else {
      return app;
    }
}

function userStore(opts = { persist: null }) {

    const auth = assertApp('auth');
    const storageKey = 'sveltefire_user';
    let cached = null;
  
    const { persist } = opts;
  
    if (persist) {
      cached = JSON.parse(opts.persist.getItem(storageKey));
    }
  
    const store = writable(cached, () => {
      const teardown = auth.onAuthStateChanged(u => {
        set(u);
        persist && opts.persist.setItem(storageKey, JSON.stringify(u));
      });
      return () => teardown;
    });
  
    const { subscribe, set } = store;
  
    return {
      subscribe,
      auth
    };
  }

/* node_modules/sveltefire/src/User.svelte generated by Svelte v3.21.0 */
const get_after_slot_changes = dirty => ({ user: dirty & /*$store*/ 1 });

const get_after_slot_context = ctx => ({
	user: /*$store*/ ctx[0],
	auth: /*store*/ ctx[1].auth
});

const get_signed_out_slot_changes = dirty => ({ user: dirty & /*$store*/ 1 });

const get_signed_out_slot_context = ctx => ({
	user: /*$store*/ ctx[0],
	auth: /*store*/ ctx[1].auth
});

const get_default_slot_changes = dirty => ({ user: dirty & /*$store*/ 1 });

const get_default_slot_context = ctx => ({
	user: /*$store*/ ctx[0],
	auth: /*store*/ ctx[1].auth
});

const get_before_slot_changes = dirty => ({ user: dirty & /*$store*/ 1 });

const get_before_slot_context = ctx => ({
	user: /*$store*/ ctx[0],
	auth: /*store*/ ctx[1].auth
});

// (24:0) {:else}
function create_else_block(ctx) {
	let current;
	const signed_out_slot_template = /*$$slots*/ ctx[6]["signed-out"];
	const signed_out_slot = create_slot(signed_out_slot_template, ctx, /*$$scope*/ ctx[5], get_signed_out_slot_context);

	const block = {
		c: function create() {
			if (signed_out_slot) signed_out_slot.c();
		},
		m: function mount(target, anchor) {
			if (signed_out_slot) {
				signed_out_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (signed_out_slot) {
				if (signed_out_slot.p && dirty & /*$$scope, $store*/ 33) {
					signed_out_slot.p(get_slot_context(signed_out_slot_template, ctx, /*$$scope*/ ctx[5], get_signed_out_slot_context), get_slot_changes(signed_out_slot_template, /*$$scope*/ ctx[5], dirty, get_signed_out_slot_changes));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(signed_out_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(signed_out_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (signed_out_slot) signed_out_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block.name,
		type: "else",
		source: "(24:0) {:else}",
		ctx
	});

	return block;
}

// (22:0) {#if $store}
function create_if_block$2(ctx) {
	let current;
	const default_slot_template = /*$$slots*/ ctx[6].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], get_default_slot_context);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope, $store*/ 33) {
					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[5], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, get_default_slot_changes));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$2.name,
		type: "if",
		source: "(22:0) {#if $store}",
		ctx
	});

	return block;
}

function create_fragment$2(ctx) {
	let t0;
	let current_block_type_index;
	let if_block;
	let t1;
	let current;
	const before_slot_template = /*$$slots*/ ctx[6].before;
	const before_slot = create_slot(before_slot_template, ctx, /*$$scope*/ ctx[5], get_before_slot_context);
	const if_block_creators = [create_if_block$2, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*$store*/ ctx[0]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	const after_slot_template = /*$$slots*/ ctx[6].after;
	const after_slot = create_slot(after_slot_template, ctx, /*$$scope*/ ctx[5], get_after_slot_context);

	const block = {
		c: function create() {
			if (before_slot) before_slot.c();
			t0 = space();
			if_block.c();
			t1 = space();
			if (after_slot) after_slot.c();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (before_slot) {
				before_slot.m(target, anchor);
			}

			insert_dev(target, t0, anchor);
			if_blocks[current_block_type_index].m(target, anchor);
			insert_dev(target, t1, anchor);

			if (after_slot) {
				after_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (before_slot) {
				if (before_slot.p && dirty & /*$$scope, $store*/ 33) {
					before_slot.p(get_slot_context(before_slot_template, ctx, /*$$scope*/ ctx[5], get_before_slot_context), get_slot_changes(before_slot_template, /*$$scope*/ ctx[5], dirty, get_before_slot_changes));
				}
			}

			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(t1.parentNode, t1);
			}

			if (after_slot) {
				if (after_slot.p && dirty & /*$$scope, $store*/ 33) {
					after_slot.p(get_slot_context(after_slot_template, ctx, /*$$scope*/ ctx[5], get_after_slot_context), get_slot_changes(after_slot_template, /*$$scope*/ ctx[5], dirty, get_after_slot_changes));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(before_slot, local);
			transition_in(if_block);
			transition_in(after_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(before_slot, local);
			transition_out(if_block);
			transition_out(after_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (before_slot) before_slot.d(detaching);
			if (detaching) detach_dev(t0);
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach_dev(t1);
			if (after_slot) after_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
	let $store;
	let { persist = null } = $$props;
	let store = userStore({ persist });
	validate_store(store, "store");
	component_subscribe($$self, store, value => $$invalidate(0, $store = value));
	const dispatch = createEventDispatcher();
	let unsub;

	onMount(() => {
		unsub = store.subscribe(user => {
			dispatch("user", { user });
		});
	});

	onDestroy(() => unsub());
	const writable_props = ["persist"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<User> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("User", $$slots, ['before','default','signed-out','after']);

	$$self.$set = $$props => {
		if ("persist" in $$props) $$invalidate(2, persist = $$props.persist);
		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		persist,
		onMount,
		onDestroy,
		createEventDispatcher,
		userStore,
		store,
		dispatch,
		unsub,
		$store
	});

	$$self.$inject_state = $$props => {
		if ("persist" in $$props) $$invalidate(2, persist = $$props.persist);
		if ("store" in $$props) $$invalidate(1, store = $$props.store);
		if ("unsub" in $$props) unsub = $$props.unsub;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [$store, store, persist, unsub, dispatch, $$scope, $$slots];
}

class User extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { persist: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "User",
			options,
			id: create_fragment$2.name
		});
	}

	get persist() {
		throw new Error("<User>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set persist(value) {
		throw new Error("<User>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

function startTrace(name) {
    const perf = assertApp('performance');
    const trace = perf.trace(name);
    trace.start();
    return trace;
  }
  
  async function stopTrace(trace) {
    if (trace.state === 2) {
      trace.stop();
    }
  
    return null;
  }

// Svelte Store for Firestore Document
function docStore(path, opts) {
  const firestore = assertApp('firestore');

  const { startWith, log, traceId, maxWait, once } = { maxWait: 10000, ...opts };

  // Create the Firestore Reference
  const ref = typeof path === 'string' ? firestore.doc(path) : path;

  // Performance trace
  const trace = traceId && startTrace(traceId);

  // Internal state
  let _loading = typeof startWith !== undefined;
  let _firstValue = true;
  let _error = null;
  let _teardown;
  let _waitForIt;


  // State should never change without emitting a new value
  // Clears loading state on first call
  const next = (val, err) => {
    _loading = false; 
    _firstValue = false;
    _waitForIt && clearTimeout(_waitForIt);
    _error = err || null;
    set(val);
    trace && stopTrace(trace);
  };

  // Timout
  // Runs of first subscription
  const start = () => {

    // Timout for fallback slot
    _waitForIt = maxWait && setTimeout(() => _loading && next(null, new Error(`Timeout at ${maxWait}. Using fallback slot.`) ), maxWait);

    // Realtime firebase subscription
    _teardown = ref.onSnapshot(
      snapshot => {
        const data = snapshot.data() || (_firstValue && startWith) || null;

        // Optional logging
        if (log) {
          console.groupCollapsed(`Doc ${snapshot.id}`);
          console.log(`Path: ${ref.path}`);
          console.log('Snapshot:', snapshot);
          console.groupEnd();
        }

        // Emit next value
        next(data);

        // Teardown after first emitted value if once
        once && _teardown();
      },

      // Handle firebase thrown errors
      error => {
        console.error(error);
        next(null, error);
      }
    );

    // Removes firebase listener when store completes
    return () => _teardown();
  };

  // Svelte store
  const store = writable(startWith, start);
  const { subscribe, set } = store;

  return {
    subscribe,
    firestore,
    ref,
    get loading() {
      return _loading;
    },
    get error() {
      return _error;
    }
  };
}

// Svelte Store for Firestore Collection
function collectionStore(path, queryFn, opts) {
  const firestore = assertApp('firestore');

  const { startWith, log, traceId, maxWait, once, idField, refField } = {
    idField: 'id',
    refField: 'ref',
    maxWait: 10000,
    ...opts
  };

  const ref = typeof path === 'string' ? firestore.collection(path) : path;
  const query = queryFn && queryFn(ref);
  const trace = traceId && startTrace(traceId);

  let _loading = typeof startWith !== undefined;
  let _error = null;
  let _meta = {};
  let _teardown;
  let _waitForIt;

  // Metadata for result
  const calcMeta = (val) => {
    return val && val.length ? 
      { first: val[0], last: val[val.length - 1] } : {}
  };

  const next = (val, err) => {
    _loading = false; 
    _waitForIt && clearTimeout(_waitForIt);
    _error = err || null;
    _meta = calcMeta(val);
    set(val);
    trace && stopTrace(trace);
  };

  const start = () => {
    _waitForIt = maxWait && setTimeout(() => _loading && next(null, new Error(`Timeout at ${maxWait}. Using fallback slot.`) ), maxWait);

    _teardown = (query || ref).onSnapshot(
      snapshot => {

        // Will always return an array
        const data = snapshot.docs.map(docSnap => ({
          ...docSnap.data(),
          // Allow end user override fields mapped for ID and Ref
          ...(idField ? { [idField]: docSnap.id } : null),
          ...(refField ? { [refField]: docSnap.ref } : null)
        }));

        if (log) {
          const type = _loading ? 'New Query' : 'Updated Query';
          console.groupCollapsed(`${type} ${ref.id} | ${data.length} hits`);
          console.log(`${ref.path}`);
          console.log(`Snapshot: `, snapshot);
          console.groupEnd();
        }
        next(data);
        once && _teardown();
      },

      error => {
        console.error(error);
        next(null, error);
      }
    );

    return () => _teardown();
  };

  const store = writable(startWith, start);
  const { subscribe, set } = store;

  return {
    subscribe,
    firestore,
    ref,
    get loading() {
      return _loading;
    },
    get error() {
      return _error;
    },
    get meta() {
      return _meta;
    }
  };
}

/* node_modules/sveltefire/src/Doc.svelte generated by Svelte v3.21.0 */

const get_after_slot_changes$1 = dirty => ({
	data: dirty & /*$store*/ 2,
	ref: dirty & /*store*/ 1,
	error: dirty & /*store*/ 1
});

const get_after_slot_context$1 = ctx => ({
	data: /*$store*/ ctx[1],
	ref: /*store*/ ctx[0].ref,
	error: /*store*/ ctx[0].error
});

const get_fallback_slot_changes = dirty => ({
	data: dirty & /*$store*/ 2,
	ref: dirty & /*store*/ 1,
	error: dirty & /*store*/ 1
});

const get_fallback_slot_context = ctx => ({
	data: /*$store*/ ctx[1],
	ref: /*store*/ ctx[0].ref,
	error: /*store*/ ctx[0].error
});

const get_loading_slot_changes = dirty => ({
	data: dirty & /*$store*/ 2,
	ref: dirty & /*store*/ 1,
	error: dirty & /*store*/ 1
});

const get_loading_slot_context = ctx => ({
	data: /*$store*/ ctx[1],
	ref: /*store*/ ctx[0].ref,
	error: /*store*/ ctx[0].error
});

const get_default_slot_changes$1 = dirty => ({
	data: dirty & /*$store*/ 2,
	ref: dirty & /*store*/ 1,
	error: dirty & /*store*/ 1
});

const get_default_slot_context$1 = ctx => ({
	data: /*$store*/ ctx[1],
	ref: /*store*/ ctx[0].ref,
	error: /*store*/ ctx[0].error
});

const get_before_slot_changes$1 = dirty => ({
	data: dirty & /*$store*/ 2,
	ref: dirty & /*store*/ 1,
	error: dirty & /*store*/ 1
});

const get_before_slot_context$1 = ctx => ({
	data: /*$store*/ ctx[1],
	ref: /*store*/ ctx[0].ref,
	error: /*store*/ ctx[0].error
});

// (52:0) {:else}
function create_else_block$1(ctx) {
	let current;
	const fallback_slot_template = /*$$slots*/ ctx[12].fallback;
	const fallback_slot = create_slot(fallback_slot_template, ctx, /*$$scope*/ ctx[11], get_fallback_slot_context);

	const block = {
		c: function create() {
			if (fallback_slot) fallback_slot.c();
		},
		m: function mount(target, anchor) {
			if (fallback_slot) {
				fallback_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (fallback_slot) {
				if (fallback_slot.p && dirty & /*$$scope, $store, store*/ 2051) {
					fallback_slot.p(get_slot_context(fallback_slot_template, ctx, /*$$scope*/ ctx[11], get_fallback_slot_context), get_slot_changes(fallback_slot_template, /*$$scope*/ ctx[11], dirty, get_fallback_slot_changes));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(fallback_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(fallback_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (fallback_slot) fallback_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block$1.name,
		type: "else",
		source: "(52:0) {:else}",
		ctx
	});

	return block;
}

// (50:24) 
function create_if_block_1$1(ctx) {
	let current;
	const loading_slot_template = /*$$slots*/ ctx[12].loading;
	const loading_slot = create_slot(loading_slot_template, ctx, /*$$scope*/ ctx[11], get_loading_slot_context);

	const block = {
		c: function create() {
			if (loading_slot) loading_slot.c();
		},
		m: function mount(target, anchor) {
			if (loading_slot) {
				loading_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (loading_slot) {
				if (loading_slot.p && dirty & /*$$scope, $store, store*/ 2051) {
					loading_slot.p(get_slot_context(loading_slot_template, ctx, /*$$scope*/ ctx[11], get_loading_slot_context), get_slot_changes(loading_slot_template, /*$$scope*/ ctx[11], dirty, get_loading_slot_changes));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(loading_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(loading_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (loading_slot) loading_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$1.name,
		type: "if",
		source: "(50:24) ",
		ctx
	});

	return block;
}

// (48:0) {#if $store}
function create_if_block$3(ctx) {
	let current;
	const default_slot_template = /*$$slots*/ ctx[12].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], get_default_slot_context$1);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope, $store, store*/ 2051) {
					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[11], get_default_slot_context$1), get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, get_default_slot_changes$1));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$3.name,
		type: "if",
		source: "(48:0) {#if $store}",
		ctx
	});

	return block;
}

function create_fragment$3(ctx) {
	let t0;
	let current_block_type_index;
	let if_block;
	let t1;
	let current;
	const before_slot_template = /*$$slots*/ ctx[12].before;
	const before_slot = create_slot(before_slot_template, ctx, /*$$scope*/ ctx[11], get_before_slot_context$1);
	const if_block_creators = [create_if_block$3, create_if_block_1$1, create_else_block$1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*$store*/ ctx[1]) return 0;
		if (/*store*/ ctx[0].loading) return 1;
		return 2;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	const after_slot_template = /*$$slots*/ ctx[12].after;
	const after_slot = create_slot(after_slot_template, ctx, /*$$scope*/ ctx[11], get_after_slot_context$1);

	const block = {
		c: function create() {
			if (before_slot) before_slot.c();
			t0 = space();
			if_block.c();
			t1 = space();
			if (after_slot) after_slot.c();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (before_slot) {
				before_slot.m(target, anchor);
			}

			insert_dev(target, t0, anchor);
			if_blocks[current_block_type_index].m(target, anchor);
			insert_dev(target, t1, anchor);

			if (after_slot) {
				after_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (before_slot) {
				if (before_slot.p && dirty & /*$$scope, $store, store*/ 2051) {
					before_slot.p(get_slot_context(before_slot_template, ctx, /*$$scope*/ ctx[11], get_before_slot_context$1), get_slot_changes(before_slot_template, /*$$scope*/ ctx[11], dirty, get_before_slot_changes$1));
				}
			}

			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(t1.parentNode, t1);
			}

			if (after_slot) {
				if (after_slot.p && dirty & /*$$scope, $store, store*/ 2051) {
					after_slot.p(get_slot_context(after_slot_template, ctx, /*$$scope*/ ctx[11], get_after_slot_context$1), get_slot_changes(after_slot_template, /*$$scope*/ ctx[11], dirty, get_after_slot_changes$1));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(before_slot, local);
			transition_in(if_block);
			transition_in(after_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(before_slot, local);
			transition_out(if_block);
			transition_out(after_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (before_slot) before_slot.d(detaching);
			if (detaching) detach_dev(t0);
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach_dev(t1);
			if (after_slot) after_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$3.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$3($$self, $$props, $$invalidate) {
	let $store,
		$$unsubscribe_store = noop,
		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(1, $store = $$value)), store);

	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
	let { path } = $$props;
	let { log = false } = $$props;
	let { traceId = "" } = $$props;
	let { startWith = undefined } = $$props; // Why? Firestore returns null for docs that don't exist, predictible loading state.
	let { maxWait = 10000 } = $$props;
	let { once = false } = $$props;
	const opts = { startWith, traceId, log, maxWait, once };
	let store = docStore(path, opts);
	validate_store(store, "store");
	$$subscribe_store();
	const dispatch = createEventDispatcher();
	let unsub;
	onMount(() => dispatch("ref", { ref: store.ref }));
	onDestroy(() => unsub());
	const writable_props = ["path", "log", "traceId", "startWith", "maxWait", "once"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Doc> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Doc", $$slots, ['before','default','loading','fallback','after']);

	$$self.$set = $$props => {
		if ("path" in $$props) $$invalidate(2, path = $$props.path);
		if ("log" in $$props) $$invalidate(3, log = $$props.log);
		if ("traceId" in $$props) $$invalidate(4, traceId = $$props.traceId);
		if ("startWith" in $$props) $$invalidate(5, startWith = $$props.startWith);
		if ("maxWait" in $$props) $$invalidate(6, maxWait = $$props.maxWait);
		if ("once" in $$props) $$invalidate(7, once = $$props.once);
		if ("$$scope" in $$props) $$invalidate(11, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		path,
		log,
		traceId,
		startWith,
		maxWait,
		once,
		onDestroy,
		onMount,
		createEventDispatcher,
		docStore,
		opts,
		store,
		dispatch,
		unsub,
		$store
	});

	$$self.$inject_state = $$props => {
		if ("path" in $$props) $$invalidate(2, path = $$props.path);
		if ("log" in $$props) $$invalidate(3, log = $$props.log);
		if ("traceId" in $$props) $$invalidate(4, traceId = $$props.traceId);
		if ("startWith" in $$props) $$invalidate(5, startWith = $$props.startWith);
		if ("maxWait" in $$props) $$invalidate(6, maxWait = $$props.maxWait);
		if ("once" in $$props) $$invalidate(7, once = $$props.once);
		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
		if ("unsub" in $$props) $$invalidate(8, unsub = $$props.unsub);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*unsub, path, store*/ 261) {
			// Props changed
			 {
				if (unsub) {
					// Unsub and create new store
					unsub();

					$$subscribe_store($$invalidate(0, store = docStore(path, opts)));
					dispatch("ref", { ref: store.ref });
				}

				$$invalidate(8, unsub = store.subscribe(data => {
					dispatch("data", { data });
				}));
			}
		}
	};

	return [
		store,
		$store,
		path,
		log,
		traceId,
		startWith,
		maxWait,
		once,
		unsub,
		opts,
		dispatch,
		$$scope,
		$$slots
	];
}

class Doc extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
			path: 2,
			log: 3,
			traceId: 4,
			startWith: 5,
			maxWait: 6,
			once: 7
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Doc",
			options,
			id: create_fragment$3.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*path*/ ctx[2] === undefined && !("path" in props)) {
			console.warn("<Doc> was created without expected prop 'path'");
		}
	}

	get path() {
		throw new Error("<Doc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set path(value) {
		throw new Error("<Doc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get log() {
		throw new Error("<Doc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set log(value) {
		throw new Error("<Doc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get traceId() {
		throw new Error("<Doc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set traceId(value) {
		throw new Error("<Doc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get startWith() {
		throw new Error("<Doc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set startWith(value) {
		throw new Error("<Doc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get maxWait() {
		throw new Error("<Doc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set maxWait(value) {
		throw new Error("<Doc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get once() {
		throw new Error("<Doc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set once(value) {
		throw new Error("<Doc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/sveltefire/src/Collection.svelte generated by Svelte v3.21.0 */

const get_after_slot_changes$2 = dirty => ({
	data: dirty & /*$store*/ 2,
	ref: dirty & /*store*/ 1,
	error: dirty & /*store*/ 1,
	first: dirty & /*store*/ 1,
	last: dirty & /*store*/ 1
});

const get_after_slot_context$2 = ctx => ({
	data: /*$store*/ ctx[1],
	ref: /*store*/ ctx[0].ref,
	error: /*store*/ ctx[0].error,
	first: /*store*/ ctx[0].meta.first,
	last: /*store*/ ctx[0].meta.last
});

const get_fallback_slot_changes$1 = dirty => ({
	data: dirty & /*$store*/ 2,
	ref: dirty & /*store*/ 1,
	error: dirty & /*store*/ 1,
	first: dirty & /*store*/ 1,
	last: dirty & /*store*/ 1
});

const get_fallback_slot_context$1 = ctx => ({
	data: /*$store*/ ctx[1],
	ref: /*store*/ ctx[0].ref,
	error: /*store*/ ctx[0].error,
	first: /*store*/ ctx[0].meta.first,
	last: /*store*/ ctx[0].meta.last
});

const get_loading_slot_changes$1 = dirty => ({
	data: dirty & /*$store*/ 2,
	ref: dirty & /*store*/ 1,
	error: dirty & /*store*/ 1,
	first: dirty & /*store*/ 1,
	last: dirty & /*store*/ 1
});

const get_loading_slot_context$1 = ctx => ({
	data: /*$store*/ ctx[1],
	ref: /*store*/ ctx[0].ref,
	error: /*store*/ ctx[0].error,
	first: /*store*/ ctx[0].meta.first,
	last: /*store*/ ctx[0].meta.last
});

const get_default_slot_changes$2 = dirty => ({
	data: dirty & /*$store*/ 2,
	ref: dirty & /*store*/ 1,
	error: dirty & /*store*/ 1,
	first: dirty & /*store*/ 1,
	last: dirty & /*store*/ 1
});

const get_default_slot_context$2 = ctx => ({
	data: /*$store*/ ctx[1],
	ref: /*store*/ ctx[0].ref,
	error: /*store*/ ctx[0].error,
	first: /*store*/ ctx[0].meta.first,
	last: /*store*/ ctx[0].meta.last
});

const get_before_slot_changes$2 = dirty => ({
	data: dirty & /*$store*/ 2,
	ref: dirty & /*store*/ 1,
	error: dirty & /*store*/ 1,
	first: dirty & /*store*/ 1,
	last: dirty & /*store*/ 1
});

const get_before_slot_context$2 = ctx => ({
	data: /*$store*/ ctx[1],
	ref: /*store*/ ctx[0].ref,
	error: /*store*/ ctx[0].error,
	first: /*store*/ ctx[0].meta.first,
	last: /*store*/ ctx[0].meta.last
});

// (52:0) {:else}
function create_else_block$2(ctx) {
	let current;
	const fallback_slot_template = /*$$slots*/ ctx[13].fallback;
	const fallback_slot = create_slot(fallback_slot_template, ctx, /*$$scope*/ ctx[12], get_fallback_slot_context$1);

	const block = {
		c: function create() {
			if (fallback_slot) fallback_slot.c();
		},
		m: function mount(target, anchor) {
			if (fallback_slot) {
				fallback_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (fallback_slot) {
				if (fallback_slot.p && dirty & /*$$scope, $store, store*/ 4099) {
					fallback_slot.p(get_slot_context(fallback_slot_template, ctx, /*$$scope*/ ctx[12], get_fallback_slot_context$1), get_slot_changes(fallback_slot_template, /*$$scope*/ ctx[12], dirty, get_fallback_slot_changes$1));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(fallback_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(fallback_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (fallback_slot) fallback_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block$2.name,
		type: "else",
		source: "(52:0) {:else}",
		ctx
	});

	return block;
}

// (50:24) 
function create_if_block_1$2(ctx) {
	let current;
	const loading_slot_template = /*$$slots*/ ctx[13].loading;
	const loading_slot = create_slot(loading_slot_template, ctx, /*$$scope*/ ctx[12], get_loading_slot_context$1);

	const block = {
		c: function create() {
			if (loading_slot) loading_slot.c();
		},
		m: function mount(target, anchor) {
			if (loading_slot) {
				loading_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (loading_slot) {
				if (loading_slot.p && dirty & /*$$scope, $store, store*/ 4099) {
					loading_slot.p(get_slot_context(loading_slot_template, ctx, /*$$scope*/ ctx[12], get_loading_slot_context$1), get_slot_changes(loading_slot_template, /*$$scope*/ ctx[12], dirty, get_loading_slot_changes$1));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(loading_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(loading_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (loading_slot) loading_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$2.name,
		type: "if",
		source: "(50:24) ",
		ctx
	});

	return block;
}

// (48:0) {#if $store}
function create_if_block$4(ctx) {
	let current;
	const default_slot_template = /*$$slots*/ ctx[13].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context$2);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope, $store, store*/ 4099) {
					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context$2), get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, get_default_slot_changes$2));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$4.name,
		type: "if",
		source: "(48:0) {#if $store}",
		ctx
	});

	return block;
}

function create_fragment$4(ctx) {
	let t0;
	let current_block_type_index;
	let if_block;
	let t1;
	let current;
	const before_slot_template = /*$$slots*/ ctx[13].before;
	const before_slot = create_slot(before_slot_template, ctx, /*$$scope*/ ctx[12], get_before_slot_context$2);
	const if_block_creators = [create_if_block$4, create_if_block_1$2, create_else_block$2];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*$store*/ ctx[1]) return 0;
		if (/*store*/ ctx[0].loading) return 1;
		return 2;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	const after_slot_template = /*$$slots*/ ctx[13].after;
	const after_slot = create_slot(after_slot_template, ctx, /*$$scope*/ ctx[12], get_after_slot_context$2);

	const block = {
		c: function create() {
			if (before_slot) before_slot.c();
			t0 = space();
			if_block.c();
			t1 = space();
			if (after_slot) after_slot.c();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (before_slot) {
				before_slot.m(target, anchor);
			}

			insert_dev(target, t0, anchor);
			if_blocks[current_block_type_index].m(target, anchor);
			insert_dev(target, t1, anchor);

			if (after_slot) {
				after_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (before_slot) {
				if (before_slot.p && dirty & /*$$scope, $store, store*/ 4099) {
					before_slot.p(get_slot_context(before_slot_template, ctx, /*$$scope*/ ctx[12], get_before_slot_context$2), get_slot_changes(before_slot_template, /*$$scope*/ ctx[12], dirty, get_before_slot_changes$2));
				}
			}

			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(t1.parentNode, t1);
			}

			if (after_slot) {
				if (after_slot.p && dirty & /*$$scope, $store, store*/ 4099) {
					after_slot.p(get_slot_context(after_slot_template, ctx, /*$$scope*/ ctx[12], get_after_slot_context$2), get_slot_changes(after_slot_template, /*$$scope*/ ctx[12], dirty, get_after_slot_changes$2));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(before_slot, local);
			transition_in(if_block);
			transition_in(after_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(before_slot, local);
			transition_out(if_block);
			transition_out(after_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (before_slot) before_slot.d(detaching);
			if (detaching) detach_dev(t0);
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach_dev(t1);
			if (after_slot) after_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$4.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$4($$self, $$props, $$invalidate) {
	let $store,
		$$unsubscribe_store = noop,
		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(1, $store = $$value)), store);

	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
	let { path } = $$props;
	let { query = null } = $$props;
	let { traceId = "" } = $$props;
	let { log = false } = $$props;
	let { startWith = undefined } = $$props;
	let { maxWait = 10000 } = $$props;
	let { once = false } = $$props;
	const opts = { startWith, traceId, log, maxWait, once };
	let store = collectionStore(path, query, opts);
	validate_store(store, "store");
	$$subscribe_store();
	const dispatch = createEventDispatcher();
	let unsub;
	onMount(() => dispatch("ref", { ref: store.ref }));
	onDestroy(() => unsub());
	const writable_props = ["path", "query", "traceId", "log", "startWith", "maxWait", "once"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Collection> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Collection", $$slots, ['before','default','loading','fallback','after']);

	$$self.$set = $$props => {
		if ("path" in $$props) $$invalidate(2, path = $$props.path);
		if ("query" in $$props) $$invalidate(3, query = $$props.query);
		if ("traceId" in $$props) $$invalidate(4, traceId = $$props.traceId);
		if ("log" in $$props) $$invalidate(5, log = $$props.log);
		if ("startWith" in $$props) $$invalidate(6, startWith = $$props.startWith);
		if ("maxWait" in $$props) $$invalidate(7, maxWait = $$props.maxWait);
		if ("once" in $$props) $$invalidate(8, once = $$props.once);
		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		path,
		query,
		traceId,
		log,
		startWith,
		maxWait,
		once,
		onDestroy,
		onMount,
		createEventDispatcher,
		collectionStore,
		opts,
		store,
		dispatch,
		unsub,
		$store
	});

	$$self.$inject_state = $$props => {
		if ("path" in $$props) $$invalidate(2, path = $$props.path);
		if ("query" in $$props) $$invalidate(3, query = $$props.query);
		if ("traceId" in $$props) $$invalidate(4, traceId = $$props.traceId);
		if ("log" in $$props) $$invalidate(5, log = $$props.log);
		if ("startWith" in $$props) $$invalidate(6, startWith = $$props.startWith);
		if ("maxWait" in $$props) $$invalidate(7, maxWait = $$props.maxWait);
		if ("once" in $$props) $$invalidate(8, once = $$props.once);
		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
		if ("unsub" in $$props) $$invalidate(9, unsub = $$props.unsub);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*unsub, path, query, store*/ 525) {
			// Props changed
			 {
				if (unsub) {
					unsub();
					$$subscribe_store($$invalidate(0, store = collectionStore(path, query, opts)));
					dispatch("ref", { ref: store.ref });
				}

				$$invalidate(9, unsub = store.subscribe(data => {
					dispatch("data", { data });
				}));
			}
		}
	};

	return [
		store,
		$store,
		path,
		query,
		traceId,
		log,
		startWith,
		maxWait,
		once,
		unsub,
		opts,
		dispatch,
		$$scope,
		$$slots
	];
}

class Collection extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
			path: 2,
			query: 3,
			traceId: 4,
			log: 5,
			startWith: 6,
			maxWait: 7,
			once: 8
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Collection",
			options,
			id: create_fragment$4.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*path*/ ctx[2] === undefined && !("path" in props)) {
			console.warn("<Collection> was created without expected prop 'path'");
		}
	}

	get path() {
		throw new Error("<Collection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set path(value) {
		throw new Error("<Collection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get query() {
		throw new Error("<Collection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set query(value) {
		throw new Error("<Collection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get traceId() {
		throw new Error("<Collection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set traceId(value) {
		throw new Error("<Collection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get log() {
		throw new Error("<Collection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set log(value) {
		throw new Error("<Collection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get startWith() {
		throw new Error("<Collection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set startWith(value) {
		throw new Error("<Collection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get maxWait() {
		throw new Error("<Collection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set maxWait(value) {
		throw new Error("<Collection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get once() {
		throw new Error("<Collection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set once(value) {
		throw new Error("<Collection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/*

Based off glamor's StyleSheet, thanks Sunil ❤️

high performance StyleSheet for css-in-js systems

- uses multiple style tags behind the scenes for millions of rules
- uses `insertRule` for appending in production for *much* faster performance

// usage

import { StyleSheet } from '@emotion/sheet'

let styleSheet = new StyleSheet({ key: '', container: document.head })

styleSheet.insert('#box { border: 1px solid red; }')
- appends a css rule into the stylesheet

styleSheet.flush()
- empties the stylesheet of all its contents

*/
// $FlowFixMe
function sheetForTag(tag) {
  if (tag.sheet) {
    // $FlowFixMe
    return tag.sheet;
  } // this weirdness brought to you by firefox

  /* istanbul ignore next */


  for (var i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].ownerNode === tag) {
      // $FlowFixMe
      return document.styleSheets[i];
    }
  }
}

function createStyleElement(options) {
  var tag = document.createElement('style');
  tag.setAttribute('data-emotion', options.key);

  if (options.nonce !== undefined) {
    tag.setAttribute('nonce', options.nonce);
  }

  tag.appendChild(document.createTextNode(''));
  return tag;
}

var StyleSheet =
/*#__PURE__*/
function () {
  function StyleSheet(options) {
    this.isSpeedy = options.speedy === undefined ? undefined === 'production' : options.speedy;
    this.tags = [];
    this.ctr = 0;
    this.nonce = options.nonce; // key is the value of the data-emotion attribute, it's used to identify different sheets

    this.key = options.key;
    this.container = options.container;
    this.before = null;
  }

  var _proto = StyleSheet.prototype;

  _proto.insert = function insert(rule) {
    // the max length is how many rules we have per style tag, it's 65000 in speedy mode
    // it's 1 in dev because we insert source maps that map a single rule to a location
    // and you can only have one source map per style tag
    if (this.ctr % (this.isSpeedy ? 65000 : 1) === 0) {
      var _tag = createStyleElement(this);

      var before;

      if (this.tags.length === 0) {
        before = this.before;
      } else {
        before = this.tags[this.tags.length - 1].nextSibling;
      }

      this.container.insertBefore(_tag, before);
      this.tags.push(_tag);
    }

    var tag = this.tags[this.tags.length - 1];

    if (this.isSpeedy) {
      var sheet = sheetForTag(tag);

      try {
        // this is a really hot path
        // we check the second character first because having "i"
        // as the second character will happen less often than
        // having "@" as the first character
        var isImportRule = rule.charCodeAt(1) === 105 && rule.charCodeAt(0) === 64; // this is the ultrafast version, works across browsers
        // the big drawback is that the css won't be editable in devtools

        sheet.insertRule(rule, // we need to insert @import rules before anything else
        // otherwise there will be an error
        // technically this means that the @import rules will
        // _usually_(not always since there could be multiple style tags)
        // be the first ones in prod and generally later in dev
        // this shouldn't really matter in the real world though
        // @import is generally only used for font faces from google fonts and etc.
        // so while this could be technically correct then it would be slower and larger
        // for a tiny bit of correctness that won't matter in the real world
        isImportRule ? 0 : sheet.cssRules.length);
      } catch (e) {
        {
          console.warn("There was a problem inserting the following rule: \"" + rule + "\"", e);
        }
      }
    } else {
      tag.appendChild(document.createTextNode(rule));
    }

    this.ctr++;
  };

  _proto.flush = function flush() {
    // $FlowFixMe
    this.tags.forEach(function (tag) {
      return tag.parentNode.removeChild(tag);
    });
    this.tags = [];
    this.ctr = 0;
  };

  return StyleSheet;
}();

function stylis_min (W) {
  function M(d, c, e, h, a) {
    for (var m = 0, b = 0, v = 0, n = 0, q, g, x = 0, K = 0, k, u = k = q = 0, l = 0, r = 0, I = 0, t = 0, B = e.length, J = B - 1, y, f = '', p = '', F = '', G = '', C; l < B;) {
      g = e.charCodeAt(l);
      l === J && 0 !== b + n + v + m && (0 !== b && (g = 47 === b ? 10 : 47), n = v = m = 0, B++, J++);

      if (0 === b + n + v + m) {
        if (l === J && (0 < r && (f = f.replace(N, '')), 0 < f.trim().length)) {
          switch (g) {
            case 32:
            case 9:
            case 59:
            case 13:
            case 10:
              break;

            default:
              f += e.charAt(l);
          }

          g = 59;
        }

        switch (g) {
          case 123:
            f = f.trim();
            q = f.charCodeAt(0);
            k = 1;

            for (t = ++l; l < B;) {
              switch (g = e.charCodeAt(l)) {
                case 123:
                  k++;
                  break;

                case 125:
                  k--;
                  break;

                case 47:
                  switch (g = e.charCodeAt(l + 1)) {
                    case 42:
                    case 47:
                      a: {
                        for (u = l + 1; u < J; ++u) {
                          switch (e.charCodeAt(u)) {
                            case 47:
                              if (42 === g && 42 === e.charCodeAt(u - 1) && l + 2 !== u) {
                                l = u + 1;
                                break a;
                              }

                              break;

                            case 10:
                              if (47 === g) {
                                l = u + 1;
                                break a;
                              }

                          }
                        }

                        l = u;
                      }

                  }

                  break;

                case 91:
                  g++;

                case 40:
                  g++;

                case 34:
                case 39:
                  for (; l++ < J && e.charCodeAt(l) !== g;) {
                  }

              }

              if (0 === k) break;
              l++;
            }

            k = e.substring(t, l);
            0 === q && (q = (f = f.replace(ca, '').trim()).charCodeAt(0));

            switch (q) {
              case 64:
                0 < r && (f = f.replace(N, ''));
                g = f.charCodeAt(1);

                switch (g) {
                  case 100:
                  case 109:
                  case 115:
                  case 45:
                    r = c;
                    break;

                  default:
                    r = O;
                }

                k = M(c, r, k, g, a + 1);
                t = k.length;
                0 < A && (r = X(O, f, I), C = H(3, k, r, c, D, z, t, g, a, h), f = r.join(''), void 0 !== C && 0 === (t = (k = C.trim()).length) && (g = 0, k = ''));
                if (0 < t) switch (g) {
                  case 115:
                    f = f.replace(da, ea);

                  case 100:
                  case 109:
                  case 45:
                    k = f + '{' + k + '}';
                    break;

                  case 107:
                    f = f.replace(fa, '$1 $2');
                    k = f + '{' + k + '}';
                    k = 1 === w || 2 === w && L('@' + k, 3) ? '@-webkit-' + k + '@' + k : '@' + k;
                    break;

                  default:
                    k = f + k, 112 === h && (k = (p += k, ''));
                } else k = '';
                break;

              default:
                k = M(c, X(c, f, I), k, h, a + 1);
            }

            F += k;
            k = I = r = u = q = 0;
            f = '';
            g = e.charCodeAt(++l);
            break;

          case 125:
          case 59:
            f = (0 < r ? f.replace(N, '') : f).trim();
            if (1 < (t = f.length)) switch (0 === u && (q = f.charCodeAt(0), 45 === q || 96 < q && 123 > q) && (t = (f = f.replace(' ', ':')).length), 0 < A && void 0 !== (C = H(1, f, c, d, D, z, p.length, h, a, h)) && 0 === (t = (f = C.trim()).length) && (f = '\x00\x00'), q = f.charCodeAt(0), g = f.charCodeAt(1), q) {
              case 0:
                break;

              case 64:
                if (105 === g || 99 === g) {
                  G += f + e.charAt(l);
                  break;
                }

              default:
                58 !== f.charCodeAt(t - 1) && (p += P(f, q, g, f.charCodeAt(2)));
            }
            I = r = u = q = 0;
            f = '';
            g = e.charCodeAt(++l);
        }
      }

      switch (g) {
        case 13:
        case 10:
          47 === b ? b = 0 : 0 === 1 + q && 107 !== h && 0 < f.length && (r = 1, f += '\x00');
          0 < A * Y && H(0, f, c, d, D, z, p.length, h, a, h);
          z = 1;
          D++;
          break;

        case 59:
        case 125:
          if (0 === b + n + v + m) {
            z++;
            break;
          }

        default:
          z++;
          y = e.charAt(l);

          switch (g) {
            case 9:
            case 32:
              if (0 === n + m + b) switch (x) {
                case 44:
                case 58:
                case 9:
                case 32:
                  y = '';
                  break;

                default:
                  32 !== g && (y = ' ');
              }
              break;

            case 0:
              y = '\\0';
              break;

            case 12:
              y = '\\f';
              break;

            case 11:
              y = '\\v';
              break;

            case 38:
              0 === n + b + m && (r = I = 1, y = '\f' + y);
              break;

            case 108:
              if (0 === n + b + m + E && 0 < u) switch (l - u) {
                case 2:
                  112 === x && 58 === e.charCodeAt(l - 3) && (E = x);

                case 8:
                  111 === K && (E = K);
              }
              break;

            case 58:
              0 === n + b + m && (u = l);
              break;

            case 44:
              0 === b + v + n + m && (r = 1, y += '\r');
              break;

            case 34:
            case 39:
              0 === b && (n = n === g ? 0 : 0 === n ? g : n);
              break;

            case 91:
              0 === n + b + v && m++;
              break;

            case 93:
              0 === n + b + v && m--;
              break;

            case 41:
              0 === n + b + m && v--;
              break;

            case 40:
              if (0 === n + b + m) {
                if (0 === q) switch (2 * x + 3 * K) {
                  case 533:
                    break;

                  default:
                    q = 1;
                }
                v++;
              }

              break;

            case 64:
              0 === b + v + n + m + u + k && (k = 1);
              break;

            case 42:
            case 47:
              if (!(0 < n + m + v)) switch (b) {
                case 0:
                  switch (2 * g + 3 * e.charCodeAt(l + 1)) {
                    case 235:
                      b = 47;
                      break;

                    case 220:
                      t = l, b = 42;
                  }

                  break;

                case 42:
                  47 === g && 42 === x && t + 2 !== l && (33 === e.charCodeAt(t + 2) && (p += e.substring(t, l + 1)), y = '', b = 0);
              }
          }

          0 === b && (f += y);
      }

      K = x;
      x = g;
      l++;
    }

    t = p.length;

    if (0 < t) {
      r = c;
      if (0 < A && (C = H(2, p, r, d, D, z, t, h, a, h), void 0 !== C && 0 === (p = C).length)) return G + p + F;
      p = r.join(',') + '{' + p + '}';

      if (0 !== w * E) {
        2 !== w || L(p, 2) || (E = 0);

        switch (E) {
          case 111:
            p = p.replace(ha, ':-moz-$1') + p;
            break;

          case 112:
            p = p.replace(Q, '::-webkit-input-$1') + p.replace(Q, '::-moz-$1') + p.replace(Q, ':-ms-input-$1') + p;
        }

        E = 0;
      }
    }

    return G + p + F;
  }

  function X(d, c, e) {
    var h = c.trim().split(ia);
    c = h;
    var a = h.length,
        m = d.length;

    switch (m) {
      case 0:
      case 1:
        var b = 0;

        for (d = 0 === m ? '' : d[0] + ' '; b < a; ++b) {
          c[b] = Z(d, c[b], e).trim();
        }

        break;

      default:
        var v = b = 0;

        for (c = []; b < a; ++b) {
          for (var n = 0; n < m; ++n) {
            c[v++] = Z(d[n] + ' ', h[b], e).trim();
          }
        }

    }

    return c;
  }

  function Z(d, c, e) {
    var h = c.charCodeAt(0);
    33 > h && (h = (c = c.trim()).charCodeAt(0));

    switch (h) {
      case 38:
        return c.replace(F, '$1' + d.trim());

      case 58:
        return d.trim() + c.replace(F, '$1' + d.trim());

      default:
        if (0 < 1 * e && 0 < c.indexOf('\f')) return c.replace(F, (58 === d.charCodeAt(0) ? '' : '$1') + d.trim());
    }

    return d + c;
  }

  function P(d, c, e, h) {
    var a = d + ';',
        m = 2 * c + 3 * e + 4 * h;

    if (944 === m) {
      d = a.indexOf(':', 9) + 1;
      var b = a.substring(d, a.length - 1).trim();
      b = a.substring(0, d).trim() + b + ';';
      return 1 === w || 2 === w && L(b, 1) ? '-webkit-' + b + b : b;
    }

    if (0 === w || 2 === w && !L(a, 1)) return a;

    switch (m) {
      case 1015:
        return 97 === a.charCodeAt(10) ? '-webkit-' + a + a : a;

      case 951:
        return 116 === a.charCodeAt(3) ? '-webkit-' + a + a : a;

      case 963:
        return 110 === a.charCodeAt(5) ? '-webkit-' + a + a : a;

      case 1009:
        if (100 !== a.charCodeAt(4)) break;

      case 969:
      case 942:
        return '-webkit-' + a + a;

      case 978:
        return '-webkit-' + a + '-moz-' + a + a;

      case 1019:
      case 983:
        return '-webkit-' + a + '-moz-' + a + '-ms-' + a + a;

      case 883:
        if (45 === a.charCodeAt(8)) return '-webkit-' + a + a;
        if (0 < a.indexOf('image-set(', 11)) return a.replace(ja, '$1-webkit-$2') + a;
        break;

      case 932:
        if (45 === a.charCodeAt(4)) switch (a.charCodeAt(5)) {
          case 103:
            return '-webkit-box-' + a.replace('-grow', '') + '-webkit-' + a + '-ms-' + a.replace('grow', 'positive') + a;

          case 115:
            return '-webkit-' + a + '-ms-' + a.replace('shrink', 'negative') + a;

          case 98:
            return '-webkit-' + a + '-ms-' + a.replace('basis', 'preferred-size') + a;
        }
        return '-webkit-' + a + '-ms-' + a + a;

      case 964:
        return '-webkit-' + a + '-ms-flex-' + a + a;

      case 1023:
        if (99 !== a.charCodeAt(8)) break;
        b = a.substring(a.indexOf(':', 15)).replace('flex-', '').replace('space-between', 'justify');
        return '-webkit-box-pack' + b + '-webkit-' + a + '-ms-flex-pack' + b + a;

      case 1005:
        return ka.test(a) ? a.replace(aa, ':-webkit-') + a.replace(aa, ':-moz-') + a : a;

      case 1e3:
        b = a.substring(13).trim();
        c = b.indexOf('-') + 1;

        switch (b.charCodeAt(0) + b.charCodeAt(c)) {
          case 226:
            b = a.replace(G, 'tb');
            break;

          case 232:
            b = a.replace(G, 'tb-rl');
            break;

          case 220:
            b = a.replace(G, 'lr');
            break;

          default:
            return a;
        }

        return '-webkit-' + a + '-ms-' + b + a;

      case 1017:
        if (-1 === a.indexOf('sticky', 9)) break;

      case 975:
        c = (a = d).length - 10;
        b = (33 === a.charCodeAt(c) ? a.substring(0, c) : a).substring(d.indexOf(':', 7) + 1).trim();

        switch (m = b.charCodeAt(0) + (b.charCodeAt(7) | 0)) {
          case 203:
            if (111 > b.charCodeAt(8)) break;

          case 115:
            a = a.replace(b, '-webkit-' + b) + ';' + a;
            break;

          case 207:
          case 102:
            a = a.replace(b, '-webkit-' + (102 < m ? 'inline-' : '') + 'box') + ';' + a.replace(b, '-webkit-' + b) + ';' + a.replace(b, '-ms-' + b + 'box') + ';' + a;
        }

        return a + ';';

      case 938:
        if (45 === a.charCodeAt(5)) switch (a.charCodeAt(6)) {
          case 105:
            return b = a.replace('-items', ''), '-webkit-' + a + '-webkit-box-' + b + '-ms-flex-' + b + a;

          case 115:
            return '-webkit-' + a + '-ms-flex-item-' + a.replace(ba, '') + a;

          default:
            return '-webkit-' + a + '-ms-flex-line-pack' + a.replace('align-content', '').replace(ba, '') + a;
        }
        break;

      case 973:
      case 989:
        if (45 !== a.charCodeAt(3) || 122 === a.charCodeAt(4)) break;

      case 931:
      case 953:
        if (!0 === la.test(d)) return 115 === (b = d.substring(d.indexOf(':') + 1)).charCodeAt(0) ? P(d.replace('stretch', 'fill-available'), c, e, h).replace(':fill-available', ':stretch') : a.replace(b, '-webkit-' + b) + a.replace(b, '-moz-' + b.replace('fill-', '')) + a;
        break;

      case 962:
        if (a = '-webkit-' + a + (102 === a.charCodeAt(5) ? '-ms-' + a : '') + a, 211 === e + h && 105 === a.charCodeAt(13) && 0 < a.indexOf('transform', 10)) return a.substring(0, a.indexOf(';', 27) + 1).replace(ma, '$1-webkit-$2') + a;
    }

    return a;
  }

  function L(d, c) {
    var e = d.indexOf(1 === c ? ':' : '{'),
        h = d.substring(0, 3 !== c ? e : 10);
    e = d.substring(e + 1, d.length - 1);
    return R(2 !== c ? h : h.replace(na, '$1'), e, c);
  }

  function ea(d, c) {
    var e = P(c, c.charCodeAt(0), c.charCodeAt(1), c.charCodeAt(2));
    return e !== c + ';' ? e.replace(oa, ' or ($1)').substring(4) : '(' + c + ')';
  }

  function H(d, c, e, h, a, m, b, v, n, q) {
    for (var g = 0, x = c, w; g < A; ++g) {
      switch (w = S[g].call(B, d, x, e, h, a, m, b, v, n, q)) {
        case void 0:
        case !1:
        case !0:
        case null:
          break;

        default:
          x = w;
      }
    }

    if (x !== c) return x;
  }

  function T(d) {
    switch (d) {
      case void 0:
      case null:
        A = S.length = 0;
        break;

      default:
        if ('function' === typeof d) S[A++] = d;else if ('object' === typeof d) for (var c = 0, e = d.length; c < e; ++c) {
          T(d[c]);
        } else Y = !!d | 0;
    }

    return T;
  }

  function U(d) {
    d = d.prefix;
    void 0 !== d && (R = null, d ? 'function' !== typeof d ? w = 1 : (w = 2, R = d) : w = 0);
    return U;
  }

  function B(d, c) {
    var e = d;
    33 > e.charCodeAt(0) && (e = e.trim());
    V = e;
    e = [V];

    if (0 < A) {
      var h = H(-1, c, e, e, D, z, 0, 0, 0, 0);
      void 0 !== h && 'string' === typeof h && (c = h);
    }

    var a = M(O, e, c, 0, 0);
    0 < A && (h = H(-2, a, e, e, D, z, a.length, 0, 0, 0), void 0 !== h && (a = h));
    V = '';
    E = 0;
    z = D = 1;
    return a;
  }

  var ca = /^\0+/g,
      N = /[\0\r\f]/g,
      aa = /: */g,
      ka = /zoo|gra/,
      ma = /([,: ])(transform)/g,
      ia = /,\r+?/g,
      F = /([\t\r\n ])*\f?&/g,
      fa = /@(k\w+)\s*(\S*)\s*/,
      Q = /::(place)/g,
      ha = /:(read-only)/g,
      G = /[svh]\w+-[tblr]{2}/,
      da = /\(\s*(.*)\s*\)/g,
      oa = /([\s\S]*?);/g,
      ba = /-self|flex-/g,
      na = /[^]*?(:[rp][el]a[\w-]+)[^]*/,
      la = /stretch|:\s*\w+\-(?:conte|avail)/,
      ja = /([^-])(image-set\()/,
      z = 1,
      D = 1,
      E = 0,
      w = 1,
      O = [],
      S = [],
      A = 0,
      R = null,
      Y = 0,
      V = '';
  B.use = T;
  B.set = U;
  void 0 !== W && U(W);
  return B;
}

// https://github.com/thysultan/stylis.js/tree/master/plugins/rule-sheet
// inlined to avoid umd wrapper and peerDep warnings/installing stylis
// since we use stylis after closure compiler
var delimiter = '/*|*/';
var needle = delimiter + '}';

function toSheet(block) {
  if (block) {
    Sheet.current.insert(block + '}');
  }
}

var Sheet = {
  current: null
};
var ruleSheet = function ruleSheet(context, content, selectors, parents, line, column, length, ns, depth, at) {
  switch (context) {
    // property
    case 1:
      {
        switch (content.charCodeAt(0)) {
          case 64:
            {
              // @import
              Sheet.current.insert(content + ';');
              return '';
            }
          // charcode for l

          case 108:
            {
              // charcode for b
              // this ignores label
              if (content.charCodeAt(2) === 98) {
                return '';
              }
            }
        }

        break;
      }
    // selector

    case 2:
      {
        if (ns === 0) return content + delimiter;
        break;
      }
    // at-rule

    case 3:
      {
        switch (ns) {
          // @font-face, @page
          case 102:
          case 112:
            {
              Sheet.current.insert(selectors[0] + content);
              return '';
            }

          default:
            {
              return content + (at === 0 ? delimiter : '');
            }
        }
      }

    case -2:
      {
        content.split(needle).forEach(toSheet);
      }
  }
};

var createCache = function createCache(options) {
  if (options === undefined) options = {};
  var key = options.key || 'css';
  var stylisOptions;

  if (options.prefix !== undefined) {
    stylisOptions = {
      prefix: options.prefix
    };
  }

  var stylis = new stylis_min(stylisOptions);

  {
    // $FlowFixMe
    if (/[^a-z-]/.test(key)) {
      throw new Error("Emotion key must only contain lower case alphabetical characters and - but \"" + key + "\" was passed");
    }
  }

  var inserted = {}; // $FlowFixMe

  var container;

  {
    container = options.container || document.head;
    var nodes = document.querySelectorAll("style[data-emotion-" + key + "]");
    Array.prototype.forEach.call(nodes, function (node) {
      var attrib = node.getAttribute("data-emotion-" + key); // $FlowFixMe

      attrib.split(' ').forEach(function (id) {
        inserted[id] = true;
      });

      if (node.parentNode !== container) {
        container.appendChild(node);
      }
    });
  }

  var _insert;

  {
    stylis.use(options.stylisPlugins)(ruleSheet);

    _insert = function insert(selector, serialized, sheet, shouldCache) {
      var name = serialized.name;
      Sheet.current = sheet;

      if ( serialized.map !== undefined) {
        var map = serialized.map;
        Sheet.current = {
          insert: function insert(rule) {
            sheet.insert(rule + map);
          }
        };
      }

      stylis(selector, serialized.styles);

      if (shouldCache) {
        cache.inserted[name] = true;
      }
    };
  }

  {
    // https://esbench.com/bench/5bf7371a4cd7e6009ef61d0a
    var commentStart = /\/\*/g;
    var commentEnd = /\*\//g;
    stylis.use(function (context, content) {
      switch (context) {
        case -1:
          {
            while (commentStart.test(content)) {
              commentEnd.lastIndex = commentStart.lastIndex;

              if (commentEnd.test(content)) {
                commentStart.lastIndex = commentEnd.lastIndex;
                continue;
              }

              throw new Error('Your styles have an unterminated comment ("/*" without corresponding "*/").');
            }

            commentStart.lastIndex = 0;
            break;
          }
      }
    });
    stylis.use(function (context, content, selectors) {
      switch (context) {
        case -1:
          {
            var flag = 'emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason';
            var unsafePseudoClasses = content.match(/(:first|:nth|:nth-last)-child/g);

            if (unsafePseudoClasses && cache.compat !== true) {
              unsafePseudoClasses.forEach(function (unsafePseudoClass) {
                var ignoreRegExp = new RegExp(unsafePseudoClass + ".*\\/\\* " + flag + " \\*\\/");
                var ignore = ignoreRegExp.test(content);

                if (unsafePseudoClass && !ignore) {
                  console.error("The pseudo class \"" + unsafePseudoClass + "\" is potentially unsafe when doing server-side rendering. Try changing it to \"" + unsafePseudoClass.split('-child')[0] + "-of-type\".");
                }
              });
            }

            break;
          }
      }
    });
  }

  var cache = {
    key: key,
    sheet: new StyleSheet({
      key: key,
      container: container,
      nonce: options.nonce,
      speedy: options.speedy
    }),
    nonce: options.nonce,
    inserted: inserted,
    registered: {},
    insert: _insert
  };
  return cache;
};

/* eslint-disable */
// Inspired by https://github.com/garycourt/murmurhash-js
// Ported from https://github.com/aappleby/smhasher/blob/61a0530f28277f2e850bfc39600ce61d02b518de/src/MurmurHash2.cpp#L37-L86
function murmur2(str) {
  // 'm' and 'r' are mixing constants generated offline.
  // They're not really 'magic', they just happen to work well.
  // const m = 0x5bd1e995;
  // const r = 24;
  // Initialize the hash
  var h = 0; // Mix 4 bytes at a time into the hash

  var k,
      i = 0,
      len = str.length;

  for (; len >= 4; ++i, len -= 4) {
    k = str.charCodeAt(i) & 0xff | (str.charCodeAt(++i) & 0xff) << 8 | (str.charCodeAt(++i) & 0xff) << 16 | (str.charCodeAt(++i) & 0xff) << 24;
    k =
    /* Math.imul(k, m): */
    (k & 0xffff) * 0x5bd1e995 + ((k >>> 16) * 0xe995 << 16);
    k ^=
    /* k >>> r: */
    k >>> 24;
    h =
    /* Math.imul(k, m): */
    (k & 0xffff) * 0x5bd1e995 + ((k >>> 16) * 0xe995 << 16) ^
    /* Math.imul(h, m): */
    (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
  } // Handle the last few bytes of the input array


  switch (len) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xff) << 16;

    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xff) << 8;

    case 1:
      h ^= str.charCodeAt(i) & 0xff;
      h =
      /* Math.imul(h, m): */
      (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
  } // Do a few final mixes of the hash to ensure the last few
  // bytes are well-incorporated.


  h ^= h >>> 13;
  h =
  /* Math.imul(h, m): */
  (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
  return ((h ^ h >>> 15) >>> 0).toString(36);
}

var unitlessKeys = {
  animationIterationCount: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,
  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1
};

function memoize(fn) {
  var cache = {};
  return function (arg) {
    if (cache[arg] === undefined) cache[arg] = fn(arg);
    return cache[arg];
  };
}

var ILLEGAL_ESCAPE_SEQUENCE_ERROR = "You have illegal escape sequence in your template literal, most likely inside content's property value.\nBecause you write your CSS inside a JavaScript string you actually have to do double escaping, so for example \"content: '\\00d7';\" should become \"content: '\\\\00d7';\".\nYou can read more about this here:\nhttps://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences";
var UNDEFINED_AS_OBJECT_KEY_ERROR = "You have passed in falsy value as style object's key (can happen when in example you pass unexported component as computed key).";
var hyphenateRegex = /[A-Z]|^ms/g;
var animationRegex = /_EMO_([^_]+?)_([^]*?)_EMO_/g;

var isCustomProperty = function isCustomProperty(property) {
  return property.charCodeAt(1) === 45;
};

var isProcessableValue = function isProcessableValue(value) {
  return value != null && typeof value !== 'boolean';
};

var processStyleName = memoize(function (styleName) {
  return isCustomProperty(styleName) ? styleName : styleName.replace(hyphenateRegex, '-$&').toLowerCase();
});

var processStyleValue = function processStyleValue(key, value) {
  switch (key) {
    case 'animation':
    case 'animationName':
      {
        if (typeof value === 'string') {
          return value.replace(animationRegex, function (match, p1, p2) {
            cursor = {
              name: p1,
              styles: p2,
              next: cursor
            };
            return p1;
          });
        }
      }
  }

  if (unitlessKeys[key] !== 1 && !isCustomProperty(key) && typeof value === 'number' && value !== 0) {
    return value + 'px';
  }

  return value;
};

{
  var contentValuePattern = /(attr|calc|counters?|url)\(/;
  var contentValues = ['normal', 'none', 'counter', 'open-quote', 'close-quote', 'no-open-quote', 'no-close-quote', 'initial', 'inherit', 'unset'];
  var oldProcessStyleValue = processStyleValue;
  var msPattern = /^-ms-/;
  var hyphenPattern = /-(.)/g;
  var hyphenatedCache = {};

  processStyleValue = function processStyleValue(key, value) {
    if (key === 'content') {
      if (typeof value !== 'string' || contentValues.indexOf(value) === -1 && !contentValuePattern.test(value) && (value.charAt(0) !== value.charAt(value.length - 1) || value.charAt(0) !== '"' && value.charAt(0) !== "'")) {
        console.error("You seem to be using a value for 'content' without quotes, try replacing it with `content: '\"" + value + "\"'`");
      }
    }

    var processed = oldProcessStyleValue(key, value);

    if (processed !== '' && !isCustomProperty(key) && key.indexOf('-') !== -1 && hyphenatedCache[key] === undefined) {
      hyphenatedCache[key] = true;
      console.error("Using kebab-case for css properties in objects is not supported. Did you mean " + key.replace(msPattern, 'ms-').replace(hyphenPattern, function (str, _char) {
        return _char.toUpperCase();
      }) + "?");
    }

    return processed;
  };
}

var shouldWarnAboutInterpolatingClassNameFromCss = true;

function handleInterpolation(mergedProps, registered, interpolation, couldBeSelectorInterpolation) {
  if (interpolation == null) {
    return '';
  }

  if (interpolation.__emotion_styles !== undefined) {
    if ( interpolation.toString() === 'NO_COMPONENT_SELECTOR') {
      throw new Error('Component selectors can only be used in conjunction with babel-plugin-emotion.');
    }

    return interpolation;
  }

  switch (typeof interpolation) {
    case 'boolean':
      {
        return '';
      }

    case 'object':
      {
        if (interpolation.anim === 1) {
          cursor = {
            name: interpolation.name,
            styles: interpolation.styles,
            next: cursor
          };
          return interpolation.name;
        }

        if (interpolation.styles !== undefined) {
          var next = interpolation.next;

          if (next !== undefined) {
            // not the most efficient thing ever but this is a pretty rare case
            // and there will be very few iterations of this generally
            while (next !== undefined) {
              cursor = {
                name: next.name,
                styles: next.styles,
                next: cursor
              };
              next = next.next;
            }
          }

          var styles = interpolation.styles + ";";

          if ( interpolation.map !== undefined) {
            styles += interpolation.map;
          }

          return styles;
        }

        return createStringFromObject(mergedProps, registered, interpolation);
      }

    case 'function':
      {
        if (mergedProps !== undefined) {
          var previousCursor = cursor;
          var result = interpolation(mergedProps);
          cursor = previousCursor;
          return handleInterpolation(mergedProps, registered, result, couldBeSelectorInterpolation);
        } else {
          console.error('Functions that are interpolated in css calls will be stringified.\n' + 'If you want to have a css call based on props, create a function that returns a css call like this\n' + 'let dynamicStyle = (props) => css`color: ${props.color}`\n' + 'It can be called directly with props or interpolated in a styled call like this\n' + "let SomeComponent = styled('div')`${dynamicStyle}`");
        }

        break;
      }

    case 'string':
      {
        var matched = [];
        var replaced = interpolation.replace(animationRegex, function (match, p1, p2) {
          var fakeVarName = "animation" + matched.length;
          matched.push("const " + fakeVarName + " = keyframes`" + p2.replace(/^@keyframes animation-\w+/, '') + "`");
          return "${" + fakeVarName + "}";
        });

        if (matched.length) {
          console.error('`keyframes` output got interpolated into plain string, please wrap it with `css`.\n\n' + 'Instead of doing this:\n\n' + [].concat(matched, ["`" + replaced + "`"]).join('\n') + '\n\nYou should wrap it with `css` like this:\n\n' + ("css`" + replaced + "`"));
        }
      }

      break;
  } // finalize string values (regular strings and functions interpolated into css calls)


  if (registered == null) {
    return interpolation;
  }

  var cached = registered[interpolation];

  if ( couldBeSelectorInterpolation && shouldWarnAboutInterpolatingClassNameFromCss && cached !== undefined) {
    console.error('Interpolating a className from css`` is not recommended and will cause problems with composition.\n' + 'Interpolating a className from css`` will be completely unsupported in a future major version of Emotion');
    shouldWarnAboutInterpolatingClassNameFromCss = false;
  }

  return cached !== undefined && !couldBeSelectorInterpolation ? cached : interpolation;
}

function createStringFromObject(mergedProps, registered, obj) {
  var string = '';

  if (Array.isArray(obj)) {
    for (var i = 0; i < obj.length; i++) {
      string += handleInterpolation(mergedProps, registered, obj[i], false);
    }
  } else {
    for (var _key in obj) {
      var value = obj[_key];

      if (typeof value !== 'object') {
        if (registered != null && registered[value] !== undefined) {
          string += _key + "{" + registered[value] + "}";
        } else if (isProcessableValue(value)) {
          string += processStyleName(_key) + ":" + processStyleValue(_key, value) + ";";
        }
      } else {
        if (_key === 'NO_COMPONENT_SELECTOR' && undefined !== 'production') {
          throw new Error('Component selectors can only be used in conjunction with babel-plugin-emotion.');
        }

        if (Array.isArray(value) && typeof value[0] === 'string' && (registered == null || registered[value[0]] === undefined)) {
          for (var _i = 0; _i < value.length; _i++) {
            if (isProcessableValue(value[_i])) {
              string += processStyleName(_key) + ":" + processStyleValue(_key, value[_i]) + ";";
            }
          }
        } else {
          var interpolated = handleInterpolation(mergedProps, registered, value, false);

          switch (_key) {
            case 'animation':
            case 'animationName':
              {
                string += processStyleName(_key) + ":" + interpolated + ";";
                break;
              }

            default:
              {
                if ( _key === 'undefined') {
                  console.error(UNDEFINED_AS_OBJECT_KEY_ERROR);
                }

                string += _key + "{" + interpolated + "}";
              }
          }
        }
      }
    }
  }

  return string;
}

var labelPattern = /label:\s*([^\s;\n{]+)\s*;/g;
var sourceMapPattern;

{
  sourceMapPattern = /\/\*#\ssourceMappingURL=data:application\/json;\S+\s+\*\//;
} // this is the cursor for keyframes
// keyframes are stored on the SerializedStyles object as a linked list


var cursor;
var serializeStyles = function serializeStyles(args, registered, mergedProps) {
  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && args[0].styles !== undefined) {
    return args[0];
  }

  var stringMode = true;
  var styles = '';
  cursor = undefined;
  var strings = args[0];

  if (strings == null || strings.raw === undefined) {
    stringMode = false;
    styles += handleInterpolation(mergedProps, registered, strings, false);
  } else {
    if ( strings[0] === undefined) {
      console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
    }

    styles += strings[0];
  } // we start at 1 since we've already handled the first arg


  for (var i = 1; i < args.length; i++) {
    styles += handleInterpolation(mergedProps, registered, args[i], styles.charCodeAt(styles.length - 1) === 46);

    if (stringMode) {
      if ( strings[i] === undefined) {
        console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
      }

      styles += strings[i];
    }
  }

  var sourceMap;

  {
    styles = styles.replace(sourceMapPattern, function (match) {
      sourceMap = match;
      return '';
    });
  } // using a global regex with .exec is stateful so lastIndex has to be reset each time


  labelPattern.lastIndex = 0;
  var identifierName = '';
  var match; // https://esbench.com/bench/5b809c2cf2949800a0f61fb5

  while ((match = labelPattern.exec(styles)) !== null) {
    identifierName += '-' + // $FlowFixMe we know it's not null
    match[1];
  }

  var name = murmur2(styles) + identifierName;

  {
    // $FlowFixMe SerializedStyles type doesn't have toString property (and we don't want to add it)
    return {
      name: name,
      styles: styles,
      map: sourceMap,
      next: cursor,
      toString: function toString() {
        return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop).";
      }
    };
  }
};

var isBrowser = "object" !== 'undefined';
function getRegisteredStyles(registered, registeredStyles, classNames) {
  var rawClassName = '';
  classNames.split(' ').forEach(function (className) {
    if (registered[className] !== undefined) {
      registeredStyles.push(registered[className]);
    } else {
      rawClassName += className + " ";
    }
  });
  return rawClassName;
}
var insertStyles = function insertStyles(cache, serialized, isStringTag) {
  var className = cache.key + "-" + serialized.name;

  if ( // we only need to add the styles to the registered cache if the
  // class name could be used further down
  // the tree but if it's a string tag, we know it won't
  // so we don't have to add it to registered cache.
  // this improves memory usage since we can avoid storing the whole style string
  (isStringTag === false || // we need to always store it if we're in compat mode and
  // in node since emotion-server relies on whether a style is in
  // the registered cache to know whether a style is global or not
  // also, note that this check will be dead code eliminated in the browser
  isBrowser === false ) && cache.registered[className] === undefined) {
    cache.registered[className] = serialized.styles;
  }

  if (cache.inserted[serialized.name] === undefined) {
    var current = serialized;

    do {
      var maybeStyles = cache.insert("." + className, current, cache.sheet, true);

      current = current.next;
    } while (current !== undefined);
  }
};

function insertWithoutScoping(cache, serialized) {
  if (cache.inserted[serialized.name] === undefined) {
    return cache.insert('', serialized, cache.sheet, true);
  }
}

function merge(registered, css, className) {
  var registeredStyles = [];
  var rawClassName = getRegisteredStyles(registered, registeredStyles, className);

  if (registeredStyles.length < 2) {
    return className;
  }

  return rawClassName + css(registeredStyles);
}

var createEmotion = function createEmotion(options) {
  var cache = createCache(options); // $FlowFixMe

  cache.sheet.speedy = function (value) {
    if ( this.ctr !== 0) {
      throw new Error('speedy must be changed before any rules are inserted');
    }

    this.isSpeedy = value;
  };

  cache.compat = true;

  var css = function css() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var serialized = serializeStyles(args, cache.registered, undefined);
    insertStyles(cache, serialized, false);
    return cache.key + "-" + serialized.name;
  };

  var keyframes = function keyframes() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var serialized = serializeStyles(args, cache.registered);
    var animation = "animation-" + serialized.name;
    insertWithoutScoping(cache, {
      name: serialized.name,
      styles: "@keyframes " + animation + "{" + serialized.styles + "}"
    });
    return animation;
  };

  var injectGlobal = function injectGlobal() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var serialized = serializeStyles(args, cache.registered);
    insertWithoutScoping(cache, serialized);
  };

  var cx = function cx() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    return merge(cache.registered, css, classnames(args));
  };

  return {
    css: css,
    cx: cx,
    injectGlobal: injectGlobal,
    keyframes: keyframes,
    hydrate: function hydrate(ids) {
      ids.forEach(function (key) {
        cache.inserted[key] = true;
      });
    },
    flush: function flush() {
      cache.registered = {};
      cache.inserted = {};
      cache.sheet.flush();
    },
    // $FlowFixMe
    sheet: cache.sheet,
    cache: cache,
    getRegisteredStyles: getRegisteredStyles.bind(null, cache.registered),
    merge: merge.bind(null, cache.registered, css)
  };
};

var classnames = function classnames(args) {
  var cls = '';

  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (arg == null) continue;
    var toAdd = void 0;

    switch (typeof arg) {
      case 'boolean':
        break;

      case 'object':
        {
          if (Array.isArray(arg)) {
            toAdd = classnames(arg);
          } else {
            toAdd = '';

            for (var k in arg) {
              if (arg[k] && k) {
                toAdd && (toAdd += ' ');
                toAdd += k;
              }
            }
          }

          break;
        }

      default:
        {
          toAdd = arg;
        }
    }

    if (toAdd) {
      cls && (cls += ' ');
      cls += toAdd;
    }
  }

  return cls;
};

var _createEmotion = createEmotion(),
    keyframes = _createEmotion.keyframes,
    css = _createEmotion.css;

const themed = derived(theme, $theme => {
  return {
    title: css `
	color: ${$theme.primary};
	
`,

    input_icon: css `
  color: ${$theme.primary};
`,

    input_field: css `
    border: 2px solid ${$theme.primary};
`,


    button: css `
  background-color: ${$theme.primary};
  color: ${$theme.text};
`,

    bg_primary: css ` background-color: ${$theme.primary};`,
    bg_palate1: css ` background-color: ${$theme.scale[1]};`,
    bg_palate2: css ` background-color: ${$theme.scale[2]};`,
    bg_palate3: css ` background-color: ${$theme.scale[3]};`,
    bg_palate4: css ` background-color: ${$theme.scale[4]};`,
    bg_palate5: css ` background-color: ${$theme.scale[5]};`,
    bg_palate6: css ` background-color: ${$theme.scale[6]};`,
    bg_palate7: css ` background-color: ${$theme.scale[7]};`,
    bg_secondary: css ` background-color: ${$theme.secondary};`,
  
  };
});

const nowrap = css`white-space: nowrap;`;

const title = css `
	font-size: 1em;
	${nowrap}
`;

const icon = css `
  width: 1em;
  height: 1em;
  padding: 0.2em;
  text-align: center;
  overflow: visible;
`;

const input_icons = css `
  width: auto; 
  margin: 0 0.25em;
`;

const input_icon = css `
  position: absolute;
  margin-top: 0.9em;
  margin-left: 0.7em;
  width: 1.5em;
  height: 1.5em;
  vertical-align: middle;
  & :focus {
		outline: 0 !important;
	}
`;

const input_field = css `
    width: 100%;
    box-sizing: border-box;
    border: 2px solid;
    border-radius: 5px;
    padding: 1em 1em 1em 3em;
    border-radius: 4px;
    font-size: 16px;
    background-color: white;
    text-align: left;
    overflow:hidden
`;
const flex_container = css `
display: flex;
flex-flow: row wrap;
align-content: space-between
padding: 0;
margin: 0;
list-style: none;
`;
const flex_item = css `

`;
const f1 = css `
    flex: 1 0 0;
`;
const f2 = css `
    flex: 2 0 0;
`;
const f3 = css `
    flex: 3 0 0;
`;
const f4 = css `
    flex: 4 0 0;
`;
const f5 = css `
    flex: 5 0 0;
`;

const rounded = css`
  border-radius: 10px;
  `;

const button = css `
  width: auto;
  ${rounded}
  border: none;
  margin: 0 0.25em;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
`;

const alert = css `
  padding: 20px;
  background-color: #222;
  border-radius: 5px;
  color: white;
  opacity: 1;
  transition: opacity 0.6s;
  margin-bottom: 15px;
  width: 100%;
  `;

const danger = css ` background-color: #f44336;`;
const success = css `background-color: #4CAF50;`;
const info = css `background-color: #2196F3;`;
const warning = css `background-color: #ff9800;`;

const closebtn = css `
  margin-left: 15px;
  color: white;
  font-weight: bold;
  float: right;
  font-size: 22px;
  line-height: 20px;
  cursor: pointer;
  transition: 0.3s;
&:hover {
  color: black;
}`;

const link = css `
  cursor: pointer;
  text-decoration: underline dotted;
  font-size: smaller;
  padding: 0.2em;
`;

const tile = css `
  width: 300px;
	border: 1px solid #aaa;
	border-radius: 2px;
	box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
	padding: 1em;
`;

const faIcon = css `
  width: auto;
  height: auto;
  text-align: center;
  overflow: visible;`;

/* src/components/awesome/svg/Path.svelte generated by Svelte v3.21.0 */

const file$1 = "src/components/awesome/svg/Path.svelte";

function create_fragment$5(ctx) {
	let path;
	let path_levels = [{ key: "path-" + /*id*/ ctx[0] }, /*data*/ ctx[1]];
	let path_data = {};

	for (let i = 0; i < path_levels.length; i += 1) {
		path_data = assign(path_data, path_levels[i]);
	}

	const block = {
		c: function create() {
			path = svg_element("path");
			set_svg_attributes(path, path_data);
			add_location(path, file$1, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, path, anchor);
		},
		p: function update(ctx, [dirty]) {
			set_svg_attributes(path, get_spread_update(path_levels, [
				dirty & /*id*/ 1 && { key: "path-" + /*id*/ ctx[0] },
				dirty & /*data*/ 2 && /*data*/ ctx[1]
			]));
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(path);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$5.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$5($$self, $$props, $$invalidate) {
	let { id = "" } = $$props;
	let { data = {} } = $$props;
	const writable_props = ["id", "data"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Path> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Path", $$slots, []);

	$$self.$set = $$props => {
		if ("id" in $$props) $$invalidate(0, id = $$props.id);
		if ("data" in $$props) $$invalidate(1, data = $$props.data);
	};

	$$self.$capture_state = () => ({ id, data });

	$$self.$inject_state = $$props => {
		if ("id" in $$props) $$invalidate(0, id = $$props.id);
		if ("data" in $$props) $$invalidate(1, data = $$props.data);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [id, data];
}

class Path extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$5, create_fragment$5, safe_not_equal, { id: 0, data: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Path",
			options,
			id: create_fragment$5.name
		});
	}

	get id() {
		throw new Error("<Path>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set id(value) {
		throw new Error("<Path>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get data() {
		throw new Error("<Path>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set data(value) {
		throw new Error("<Path>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/awesome/svg/Polygon.svelte generated by Svelte v3.21.0 */

const file$2 = "src/components/awesome/svg/Polygon.svelte";

function create_fragment$6(ctx) {
	let polygon;
	let polygon_levels = [{ key: "polygon-" + /*id*/ ctx[0] }, /*data*/ ctx[1]];
	let polygon_data = {};

	for (let i = 0; i < polygon_levels.length; i += 1) {
		polygon_data = assign(polygon_data, polygon_levels[i]);
	}

	const block = {
		c: function create() {
			polygon = svg_element("polygon");
			set_svg_attributes(polygon, polygon_data);
			add_location(polygon, file$2, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, polygon, anchor);
		},
		p: function update(ctx, [dirty]) {
			set_svg_attributes(polygon, get_spread_update(polygon_levels, [
				dirty & /*id*/ 1 && { key: "polygon-" + /*id*/ ctx[0] },
				dirty & /*data*/ 2 && /*data*/ ctx[1]
			]));
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(polygon);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$6.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$6($$self, $$props, $$invalidate) {
	let { id = "" } = $$props;
	let { data = {} } = $$props;
	const writable_props = ["id", "data"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Polygon> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Polygon", $$slots, []);

	$$self.$set = $$props => {
		if ("id" in $$props) $$invalidate(0, id = $$props.id);
		if ("data" in $$props) $$invalidate(1, data = $$props.data);
	};

	$$self.$capture_state = () => ({ id, data });

	$$self.$inject_state = $$props => {
		if ("id" in $$props) $$invalidate(0, id = $$props.id);
		if ("data" in $$props) $$invalidate(1, data = $$props.data);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [id, data];
}

class Polygon extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$6, create_fragment$6, safe_not_equal, { id: 0, data: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Polygon",
			options,
			id: create_fragment$6.name
		});
	}

	get id() {
		throw new Error("<Polygon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set id(value) {
		throw new Error("<Polygon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get data() {
		throw new Error("<Polygon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set data(value) {
		throw new Error("<Polygon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/awesome/svg/Raw.svelte generated by Svelte v3.21.0 */

const file$3 = "src/components/awesome/svg/Raw.svelte";

function create_fragment$7(ctx) {
	let g;

	const block = {
		c: function create() {
			g = svg_element("g");
			add_location(g, file$3, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, g, anchor);
			g.innerHTML = /*raw*/ ctx[0];
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*raw*/ 1) g.innerHTML = /*raw*/ ctx[0];		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(g);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$7.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$7($$self, $$props, $$invalidate) {
	let cursor = 870711;

	function getId() {
		cursor += 1;
		return `fa-${cursor.toString(16)}`;
	}

	let raw;
	let { data } = $$props;

	function getRaw(data) {
		if (!data || !data.raw) {
			return null;
		}

		let rawData = data.raw;
		const ids = {};

		rawData = rawData.replace(/\s(?:xml:)?id=["']?([^"')\s]+)/g, (match, id) => {
			const uniqueId = getId();
			ids[id] = uniqueId;
			return ` id="${uniqueId}"`;
		});

		rawData = rawData.replace(/#(?:([^'")\s]+)|xpointer\(id\((['"]?)([^')]+)\2\)\))/g, (match, rawId, _, pointerId) => {
			const id = rawId || pointerId;

			if (!id || !ids[id]) {
				return match;
			}

			return `#${ids[id]}`;
		});

		return rawData;
	}

	const writable_props = ["data"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Raw> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Raw", $$slots, []);

	$$self.$set = $$props => {
		if ("data" in $$props) $$invalidate(1, data = $$props.data);
	};

	$$self.$capture_state = () => ({ cursor, getId, raw, data, getRaw });

	$$self.$inject_state = $$props => {
		if ("cursor" in $$props) cursor = $$props.cursor;
		if ("raw" in $$props) $$invalidate(0, raw = $$props.raw);
		if ("data" in $$props) $$invalidate(1, data = $$props.data);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*data*/ 2) {
			 $$invalidate(0, raw = getRaw(data));
		}
	};

	return [raw, data];
}

class Raw extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$7, create_fragment$7, safe_not_equal, { data: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Raw",
			options,
			id: create_fragment$7.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*data*/ ctx[1] === undefined && !("data" in props)) {
			console.warn("<Raw> was created without expected prop 'data'");
		}
	}

	get data() {
		throw new Error("<Raw>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set data(value) {
		throw new Error("<Raw>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

const spin= keyframes`
    0% {transform: rotate(0deg);}
    100% {transform: rotate(360deg);}
`;
  
// Icons
const fa = {
    icon: css`
      display: inline-block;
      fill: currentColor;
    `,
    flip_horizontal: css`
      transform: scale(-1, 1);
      `,
    flip_vertical: css`
      transform: scale(1, -1);
      `,
    spin: css`
      animation: ${spin} 1s 0s infinite linear;
    `,
    inverse: css`
      color: #fff;
    `,
    pulse: css`
      animation: ${spin} 1s infinite steps(8);
    `
  };

/* src/components/awesome/svg/Svg.svelte generated by Svelte v3.21.0 */
const file$4 = "src/components/awesome/svg/Svg.svelte";

function create_fragment$8(ctx) {
	let svg;
	let svg_role_value;
	let current;
	const default_slot_template = /*$$slots*/ ctx[14].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);

	const block = {
		c: function create() {
			svg = svg_element("svg");
			if (default_slot) default_slot.c();
			attr_dev(svg, "version", "1.1");
			attr_dev(svg, "class", /*classes*/ ctx[7]);
			attr_dev(svg, "x", /*x*/ ctx[3]);
			attr_dev(svg, "y", /*y*/ ctx[4]);
			attr_dev(svg, "width", /*width*/ ctx[0]);
			attr_dev(svg, "height", /*height*/ ctx[1]);
			attr_dev(svg, "aria-label", /*label*/ ctx[6]);
			attr_dev(svg, "role", svg_role_value = /*label*/ ctx[6] ? "img" : "presentation");
			attr_dev(svg, "viewBox", /*box*/ ctx[2]);
			attr_dev(svg, "style", /*style*/ ctx[5]);
			add_location(svg, file$4, 27, 0, 660);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);

			if (default_slot) {
				default_slot.m(svg, null);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 8192) {
					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[13], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[13], dirty, null));
				}
			}

			if (!current || dirty & /*x*/ 8) {
				attr_dev(svg, "x", /*x*/ ctx[3]);
			}

			if (!current || dirty & /*y*/ 16) {
				attr_dev(svg, "y", /*y*/ ctx[4]);
			}

			if (!current || dirty & /*width*/ 1) {
				attr_dev(svg, "width", /*width*/ ctx[0]);
			}

			if (!current || dirty & /*height*/ 2) {
				attr_dev(svg, "height", /*height*/ ctx[1]);
			}

			if (!current || dirty & /*label*/ 64) {
				attr_dev(svg, "aria-label", /*label*/ ctx[6]);
			}

			if (!current || dirty & /*label*/ 64 && svg_role_value !== (svg_role_value = /*label*/ ctx[6] ? "img" : "presentation")) {
				attr_dev(svg, "role", svg_role_value);
			}

			if (!current || dirty & /*box*/ 4) {
				attr_dev(svg, "viewBox", /*box*/ ctx[2]);
			}

			if (!current || dirty & /*style*/ 32) {
				attr_dev(svg, "style", /*style*/ ctx[5]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$8.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$8($$self, $$props, $$invalidate) {
	let { class: className } = $$props;
	let { width } = $$props;
	let { height } = $$props;
	let { box } = $$props;
	let { spin = false } = $$props;
	let { inverse = false } = $$props;
	let { pulse = false } = $$props;
	let { flip = null } = $$props;
	let { x = undefined } = $$props;
	let { y = undefined } = $$props;
	let { style = undefined } = $$props;
	let { label = undefined } = $$props;
	let classes = `${fa.icon} ${className}` + (spin ? ` ${fa.spin}` : "") + (pulse ? ` ${fa.pulse}` : "") + (inverse ? ` ${fa.inverse}` : "") + (flip === "horizontal" ? ` ${fa.flip_horizontal}` : "") + (flip === "vertical" ? ` ${fa.flip_vertical}` : "");

	const writable_props = [
		"class",
		"width",
		"height",
		"box",
		"spin",
		"inverse",
		"pulse",
		"flip",
		"x",
		"y",
		"style",
		"label"
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Svg> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Svg", $$slots, ['default']);

	$$self.$set = $$props => {
		if ("class" in $$props) $$invalidate(8, className = $$props.class);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("box" in $$props) $$invalidate(2, box = $$props.box);
		if ("spin" in $$props) $$invalidate(9, spin = $$props.spin);
		if ("inverse" in $$props) $$invalidate(10, inverse = $$props.inverse);
		if ("pulse" in $$props) $$invalidate(11, pulse = $$props.pulse);
		if ("flip" in $$props) $$invalidate(12, flip = $$props.flip);
		if ("x" in $$props) $$invalidate(3, x = $$props.x);
		if ("y" in $$props) $$invalidate(4, y = $$props.y);
		if ("style" in $$props) $$invalidate(5, style = $$props.style);
		if ("label" in $$props) $$invalidate(6, label = $$props.label);
		if ("$$scope" in $$props) $$invalidate(13, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		fa,
		className,
		width,
		height,
		box,
		spin,
		inverse,
		pulse,
		flip,
		x,
		y,
		style,
		label,
		classes
	});

	$$self.$inject_state = $$props => {
		if ("className" in $$props) $$invalidate(8, className = $$props.className);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("box" in $$props) $$invalidate(2, box = $$props.box);
		if ("spin" in $$props) $$invalidate(9, spin = $$props.spin);
		if ("inverse" in $$props) $$invalidate(10, inverse = $$props.inverse);
		if ("pulse" in $$props) $$invalidate(11, pulse = $$props.pulse);
		if ("flip" in $$props) $$invalidate(12, flip = $$props.flip);
		if ("x" in $$props) $$invalidate(3, x = $$props.x);
		if ("y" in $$props) $$invalidate(4, y = $$props.y);
		if ("style" in $$props) $$invalidate(5, style = $$props.style);
		if ("label" in $$props) $$invalidate(6, label = $$props.label);
		if ("classes" in $$props) $$invalidate(7, classes = $$props.classes);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		width,
		height,
		box,
		x,
		y,
		style,
		label,
		classes,
		className,
		spin,
		inverse,
		pulse,
		flip,
		$$scope,
		$$slots
	];
}

class Svg extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
			class: 8,
			width: 0,
			height: 1,
			box: 2,
			spin: 9,
			inverse: 10,
			pulse: 11,
			flip: 12,
			x: 3,
			y: 4,
			style: 5,
			label: 6
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Svg",
			options,
			id: create_fragment$8.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*className*/ ctx[8] === undefined && !("class" in props)) {
			console.warn("<Svg> was created without expected prop 'class'");
		}

		if (/*width*/ ctx[0] === undefined && !("width" in props)) {
			console.warn("<Svg> was created without expected prop 'width'");
		}

		if (/*height*/ ctx[1] === undefined && !("height" in props)) {
			console.warn("<Svg> was created without expected prop 'height'");
		}

		if (/*box*/ ctx[2] === undefined && !("box" in props)) {
			console.warn("<Svg> was created without expected prop 'box'");
		}
	}

	get class() {
		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set class(value) {
		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get box() {
		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set box(value) {
		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get spin() {
		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set spin(value) {
		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get inverse() {
		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set inverse(value) {
		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get pulse() {
		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set pulse(value) {
		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get flip() {
		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set flip(value) {
		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get x() {
		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set x(value) {
		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get y() {
		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set y(value) {
		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get style() {
		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set style(value) {
		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get label() {
		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set label(value) {
		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/awesome/Icon.svelte generated by Svelte v3.21.0 */

const { Object: Object_1$1, console: console_1 } = globals;

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[29] = list[i];
	child_ctx[31] = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[32] = list[i];
	child_ctx[31] = i;
	return child_ctx;
}

// (171:2) {#if self}
function create_if_block$5(ctx) {
	let t0;
	let t1;
	let if_block2_anchor;
	let current;
	let if_block0 = /*self*/ ctx[0].paths && create_if_block_3(ctx);
	let if_block1 = /*self*/ ctx[0].polygons && create_if_block_2(ctx);
	let if_block2 = /*self*/ ctx[0].raw && create_if_block_1$3(ctx);

	const block = {
		c: function create() {
			if (if_block0) if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			if (if_block2) if_block2.c();
			if_block2_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert_dev(target, t0, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert_dev(target, t1, anchor);
			if (if_block2) if_block2.m(target, anchor);
			insert_dev(target, if_block2_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (/*self*/ ctx[0].paths) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty[0] & /*self*/ 1) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_3(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(t0.parentNode, t0);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (/*self*/ ctx[0].polygons) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty[0] & /*self*/ 1) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_2(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(t1.parentNode, t1);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (/*self*/ ctx[0].raw) {
				if (if_block2) {
					if_block2.p(ctx, dirty);

					if (dirty[0] & /*self*/ 1) {
						transition_in(if_block2, 1);
					}
				} else {
					if_block2 = create_if_block_1$3(ctx);
					if_block2.c();
					transition_in(if_block2, 1);
					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
				}
			} else if (if_block2) {
				group_outros();

				transition_out(if_block2, 1, 1, () => {
					if_block2 = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			transition_in(if_block2);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			transition_out(if_block2);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block0) if_block0.d(detaching);
			if (detaching) detach_dev(t0);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach_dev(t1);
			if (if_block2) if_block2.d(detaching);
			if (detaching) detach_dev(if_block2_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$5.name,
		type: "if",
		source: "(171:2) {#if self}",
		ctx
	});

	return block;
}

// (172:3) {#if self.paths}
function create_if_block_3(ctx) {
	let each_1_anchor;
	let current;
	let each_value_1 = /*self*/ ctx[0].paths;
	validate_each_argument(each_value_1);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert_dev(target, each_1_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*self*/ 1) {
				each_value_1 = /*self*/ ctx[0].paths;
				validate_each_argument(each_value_1);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				group_outros();

				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;

			for (let i = 0; i < each_value_1.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o: function outro(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d: function destroy(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(each_1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3.name,
		type: "if",
		source: "(172:3) {#if self.paths}",
		ctx
	});

	return block;
}

// (173:4) {#each self.paths as path, i}
function create_each_block_1(ctx) {
	let current;

	const path = new Path({
			props: {
				id: /*i*/ ctx[31],
				data: /*path*/ ctx[32]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(path.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(path, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const path_changes = {};
			if (dirty[0] & /*self*/ 1) path_changes.data = /*path*/ ctx[32];
			path.$set(path_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(path.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(path.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(path, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block_1.name,
		type: "each",
		source: "(173:4) {#each self.paths as path, i}",
		ctx
	});

	return block;
}

// (177:3) {#if self.polygons}
function create_if_block_2(ctx) {
	let each_1_anchor;
	let current;
	let each_value = /*self*/ ctx[0].polygons;
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert_dev(target, each_1_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*self*/ 1) {
				each_value = /*self*/ ctx[0].polygons;
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o: function outro(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d: function destroy(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(each_1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2.name,
		type: "if",
		source: "(177:3) {#if self.polygons}",
		ctx
	});

	return block;
}

// (178:4) {#each self.polygons as polygon, i}
function create_each_block(ctx) {
	let current;

	const polygon = new Polygon({
			props: {
				id: /*i*/ ctx[31],
				data: /*polygon*/ ctx[29]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(polygon.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(polygon, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const polygon_changes = {};
			if (dirty[0] & /*self*/ 1) polygon_changes.data = /*polygon*/ ctx[29];
			polygon.$set(polygon_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(polygon.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(polygon.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(polygon, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block.name,
		type: "each",
		source: "(178:4) {#each self.polygons as polygon, i}",
		ctx
	});

	return block;
}

// (182:3) {#if self.raw}
function create_if_block_1$3(ctx) {
	let updating_data;
	let current;

	function raw_data_binding(value) {
		/*raw_data_binding*/ ctx[27].call(null, value);
	}

	let raw_props = {};

	if (/*self*/ ctx[0] !== void 0) {
		raw_props.data = /*self*/ ctx[0];
	}

	const raw = new Raw({ props: raw_props, $$inline: true });
	binding_callbacks.push(() => bind(raw, "data", raw_data_binding));

	const block = {
		c: function create() {
			create_component(raw.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(raw, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const raw_changes = {};

			if (!updating_data && dirty[0] & /*self*/ 1) {
				updating_data = true;
				raw_changes.data = /*self*/ ctx[0];
				add_flush_callback(() => updating_data = false);
			}

			raw.$set(raw_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(raw.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(raw.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(raw, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$3.name,
		type: "if",
		source: "(182:3) {#if self.raw}",
		ctx
	});

	return block;
}

// (170:7)    
function fallback_block(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*self*/ ctx[0] && create_if_block$5(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (/*self*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty[0] & /*self*/ 1) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$5(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: fallback_block.name,
		type: "fallback",
		source: "(170:7)    ",
		ctx
	});

	return block;
}

// (159:0) <Svg  {label}  {width}  {height}  {box}  style={combinedStyle}  {spin}  {flip}  {inverse}  {pulse}  class={className}>
function create_default_slot(ctx) {
	let current;
	const default_slot_template = /*$$slots*/ ctx[26].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[28], null);
	const default_slot_or_fallback = default_slot || fallback_block(ctx);

	const block = {
		c: function create() {
			if (default_slot_or_fallback) default_slot_or_fallback.c();
		},
		m: function mount(target, anchor) {
			if (default_slot_or_fallback) {
				default_slot_or_fallback.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty[0] & /*$$scope*/ 268435456) {
					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[28], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[28], dirty, null));
				}
			} else {
				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty[0] & /*self*/ 1) {
					default_slot_or_fallback.p(ctx, dirty);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot_or_fallback, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot_or_fallback, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(159:0) <Svg  {label}  {width}  {height}  {box}  style={combinedStyle}  {spin}  {flip}  {inverse}  {pulse}  class={className}>",
		ctx
	});

	return block;
}

function create_fragment$9(ctx) {
	let current;

	const svg = new Svg({
			props: {
				label: /*label*/ ctx[6],
				width: /*width*/ ctx[7],
				height: /*height*/ ctx[8],
				box: /*box*/ ctx[10],
				style: /*combinedStyle*/ ctx[9],
				spin: /*spin*/ ctx[2],
				flip: /*flip*/ ctx[5],
				inverse: /*inverse*/ ctx[3],
				pulse: /*pulse*/ ctx[4],
				class: /*className*/ ctx[1],
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(svg.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(svg, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const svg_changes = {};
			if (dirty[0] & /*label*/ 64) svg_changes.label = /*label*/ ctx[6];
			if (dirty[0] & /*width*/ 128) svg_changes.width = /*width*/ ctx[7];
			if (dirty[0] & /*height*/ 256) svg_changes.height = /*height*/ ctx[8];
			if (dirty[0] & /*box*/ 1024) svg_changes.box = /*box*/ ctx[10];
			if (dirty[0] & /*combinedStyle*/ 512) svg_changes.style = /*combinedStyle*/ ctx[9];
			if (dirty[0] & /*spin*/ 4) svg_changes.spin = /*spin*/ ctx[2];
			if (dirty[0] & /*flip*/ 32) svg_changes.flip = /*flip*/ ctx[5];
			if (dirty[0] & /*inverse*/ 8) svg_changes.inverse = /*inverse*/ ctx[3];
			if (dirty[0] & /*pulse*/ 16) svg_changes.pulse = /*pulse*/ ctx[4];
			if (dirty[0] & /*className*/ 2) svg_changes.class = /*className*/ ctx[1];

			if (dirty[0] & /*$$scope, self*/ 268435457) {
				svg_changes.$$scope = { dirty, ctx };
			}

			svg.$set(svg_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(svg.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(svg.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(svg, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$9.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function normaliseData(data) {
	if ("iconName" in data && "icon" in data) {
		let normalisedData = {};
		let faIcon = data.icon;
		let name = data.iconName;
		let width = faIcon[0];
		let height = faIcon[1];
		let paths = faIcon[4];
		let iconData = { width, height, paths: [{ d: paths }] };
		normalisedData[name] = iconData;
		return normalisedData;
	}

	return data;
}

function instance$9($$self, $$props, $$invalidate) {
	let { class: className = "" } = $$props;
	let { data } = $$props;
	let { scale = 1 } = $$props;
	let { spin = false } = $$props;
	let { inverse = false } = $$props;
	let { pulse = false } = $$props;
	let { flip = null } = $$props;
	let { label = null } = $$props;
	let { self = null } = $$props;
	let { style = null } = $$props;

	// internal
	let x = 0;

	let y = 0;
	let childrenHeight = 0;
	let childrenWidth = 0;
	let outerScale = 1;
	let width;
	let height;
	let combinedStyle;
	let box;

	function init() {
		if (typeof data === "undefined") {
			return;
		}

		const normalisedData = normaliseData(data);
		const [name] = Object.keys(normalisedData);
		const icon = normalisedData[name];

		if (!icon.paths) {
			icon.paths = [];
		}

		if (icon.d) {
			icon.paths.push({ d: icon.d });
		}

		if (!icon.polygons) {
			icon.polygons = [];
		}

		if (icon.points) {
			icon.polygons.push({ points: icon.points });
		}

		$$invalidate(0, self = icon);
	}

	function normalisedScale() {
		let numScale = 1;

		if (typeof scale !== "undefined") {
			numScale = Number(scale);
		}

		if (isNaN(numScale) || numScale <= 0) {
			// eslint-disable-line no-restricted-globals
			console.warn("Invalid prop: prop \"scale\" should be a number over 0."); // eslint-disable-line no-console

			return outerScale;
		}

		return numScale * outerScale;
	}

	function calculateBox() {
		if (self) {
			return `0 0 ${self.width} ${self.height}`;
		}

		return `0 0 ${width} ${height}`;
	}

	function calculateRatio() {
		if (!self) {
			return 1;
		}

		return Math.max(self.width, self.height) / 16;
	}

	function calculateWidth() {
		if (childrenWidth) {
			return childrenWidth;
		}

		if (self) {
			return self.width / calculateRatio() * normalisedScale();
		}

		return 0;
	}

	function calculateHeight() {
		if (childrenHeight) {
			return childrenHeight;
		}

		if (self) {
			return self.height / calculateRatio() * normalisedScale();
		}

		return 0;
	}

	function calculateStyle() {
		let combined = "";

		if (style !== null) {
			combined += style;
		}

		let size = normalisedScale();

		if (size === 1) {
			return combined;
		}

		if (combined !== "" && !combined.endsWith(";")) {
			combined += "; ";
		}

		return `${combined}font-size: ${size}em`;
	}

	const writable_props = [
		"class",
		"data",
		"scale",
		"spin",
		"inverse",
		"pulse",
		"flip",
		"label",
		"self",
		"style"
	];

	Object_1$1.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Icon> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Icon", $$slots, ['default']);

	function raw_data_binding(value) {
		self = value;
		$$invalidate(0, self);
	}

	$$self.$set = $$props => {
		if ("class" in $$props) $$invalidate(1, className = $$props.class);
		if ("data" in $$props) $$invalidate(11, data = $$props.data);
		if ("scale" in $$props) $$invalidate(12, scale = $$props.scale);
		if ("spin" in $$props) $$invalidate(2, spin = $$props.spin);
		if ("inverse" in $$props) $$invalidate(3, inverse = $$props.inverse);
		if ("pulse" in $$props) $$invalidate(4, pulse = $$props.pulse);
		if ("flip" in $$props) $$invalidate(5, flip = $$props.flip);
		if ("label" in $$props) $$invalidate(6, label = $$props.label);
		if ("self" in $$props) $$invalidate(0, self = $$props.self);
		if ("style" in $$props) $$invalidate(13, style = $$props.style);
		if ("$$scope" in $$props) $$invalidate(28, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		Path,
		Polygon,
		Raw,
		Svg,
		className,
		data,
		scale,
		spin,
		inverse,
		pulse,
		flip,
		label,
		self,
		style,
		x,
		y,
		childrenHeight,
		childrenWidth,
		outerScale,
		width,
		height,
		combinedStyle,
		box,
		init,
		normaliseData,
		normalisedScale,
		calculateBox,
		calculateRatio,
		calculateWidth,
		calculateHeight,
		calculateStyle
	});

	$$self.$inject_state = $$props => {
		if ("className" in $$props) $$invalidate(1, className = $$props.className);
		if ("data" in $$props) $$invalidate(11, data = $$props.data);
		if ("scale" in $$props) $$invalidate(12, scale = $$props.scale);
		if ("spin" in $$props) $$invalidate(2, spin = $$props.spin);
		if ("inverse" in $$props) $$invalidate(3, inverse = $$props.inverse);
		if ("pulse" in $$props) $$invalidate(4, pulse = $$props.pulse);
		if ("flip" in $$props) $$invalidate(5, flip = $$props.flip);
		if ("label" in $$props) $$invalidate(6, label = $$props.label);
		if ("self" in $$props) $$invalidate(0, self = $$props.self);
		if ("style" in $$props) $$invalidate(13, style = $$props.style);
		if ("x" in $$props) x = $$props.x;
		if ("y" in $$props) y = $$props.y;
		if ("childrenHeight" in $$props) childrenHeight = $$props.childrenHeight;
		if ("childrenWidth" in $$props) childrenWidth = $$props.childrenWidth;
		if ("outerScale" in $$props) outerScale = $$props.outerScale;
		if ("width" in $$props) $$invalidate(7, width = $$props.width);
		if ("height" in $$props) $$invalidate(8, height = $$props.height);
		if ("combinedStyle" in $$props) $$invalidate(9, combinedStyle = $$props.combinedStyle);
		if ("box" in $$props) $$invalidate(10, box = $$props.box);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*data, style, scale*/ 14336) {
			 {
				init();
				$$invalidate(7, width = calculateWidth());
				$$invalidate(8, height = calculateHeight());
				$$invalidate(9, combinedStyle = calculateStyle());
				$$invalidate(10, box = calculateBox());
			}
		}
	};

	return [
		self,
		className,
		spin,
		inverse,
		pulse,
		flip,
		label,
		width,
		height,
		combinedStyle,
		box,
		data,
		scale,
		style,
		x,
		y,
		childrenHeight,
		childrenWidth,
		outerScale,
		init,
		normalisedScale,
		calculateBox,
		calculateRatio,
		calculateWidth,
		calculateHeight,
		calculateStyle,
		$$slots,
		raw_data_binding,
		$$scope
	];
}

class Icon extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(
			this,
			options,
			instance$9,
			create_fragment$9,
			safe_not_equal,
			{
				class: 1,
				data: 11,
				scale: 12,
				spin: 2,
				inverse: 3,
				pulse: 4,
				flip: 5,
				label: 6,
				self: 0,
				style: 13
			},
			[-1, -1]
		);

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Icon",
			options,
			id: create_fragment$9.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*data*/ ctx[11] === undefined && !("data" in props)) {
			console_1.warn("<Icon> was created without expected prop 'data'");
		}
	}

	get class() {
		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set class(value) {
		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get data() {
		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set data(value) {
		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get scale() {
		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set scale(value) {
		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get spin() {
		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set spin(value) {
		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get inverse() {
		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set inverse(value) {
		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get pulse() {
		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set pulse(value) {
		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get flip() {
		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set flip(value) {
		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get label() {
		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set label(value) {
		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get self() {
		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set self(value) {
		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get style() {
		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set style(value) {
		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

var faUserAlt = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'user-alt';
var width = 512;
var height = 512;
var ligatures = [];
var unicode = 'f406';
var svgPathData = 'M256 288c79.5 0 144-64.5 144-144S335.5 0 256 0 112 64.5 112 144s64.5 144 144 144zm128 32h-55.1c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16H128C57.3 320 0 377.3 0 448v16c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-16c0-70.7-57.3-128-128-128z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faUserAlt = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faUserAlt);
var faUserAlt_1 = faUserAlt.definition;
var faUserAlt_2 = faUserAlt.faUserAlt;
var faUserAlt_3 = faUserAlt.prefix;
var faUserAlt_4 = faUserAlt.iconName;
var faUserAlt_5 = faUserAlt.width;
var faUserAlt_6 = faUserAlt.height;
var faUserAlt_7 = faUserAlt.ligatures;
var faUserAlt_8 = faUserAlt.unicode;
var faUserAlt_9 = faUserAlt.svgPathData;

var faUserAltSlash = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'user-alt-slash';
var width = 640;
var height = 512;
var ligatures = [];
var unicode = 'f4fa';
var svgPathData = 'M633.8 458.1L389.6 269.3C433.8 244.7 464 198.1 464 144 464 64.5 399.5 0 320 0c-67.1 0-123 46.1-139 108.2L45.5 3.4C38.5-2 28.5-.8 23 6.2L3.4 31.4c-5.4 7-4.2 17 2.8 22.4l588.4 454.7c7 5.4 17 4.2 22.5-2.8l19.6-25.3c5.4-6.8 4.1-16.9-2.9-22.3zM198.4 320C124.2 320 64 380.2 64 454.4v9.6c0 26.5 21.5 48 48 48h382.2L245.8 320h-47.4z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faUserAltSlash = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faUserAltSlash);
var faUserAltSlash_1 = faUserAltSlash.definition;
var faUserAltSlash_2 = faUserAltSlash.faUserAltSlash;
var faUserAltSlash_3 = faUserAltSlash.prefix;
var faUserAltSlash_4 = faUserAltSlash.iconName;
var faUserAltSlash_5 = faUserAltSlash.width;
var faUserAltSlash_6 = faUserAltSlash.height;
var faUserAltSlash_7 = faUserAltSlash.ligatures;
var faUserAltSlash_8 = faUserAltSlash.unicode;
var faUserAltSlash_9 = faUserAltSlash.svgPathData;

var faMapMarkerAlt = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'map-marker-alt';
var width = 384;
var height = 512;
var ligatures = [];
var unicode = 'f3c5';
var svgPathData = 'M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faMapMarkerAlt = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faMapMarkerAlt);
var faMapMarkerAlt_1 = faMapMarkerAlt.definition;
var faMapMarkerAlt_2 = faMapMarkerAlt.faMapMarkerAlt;
var faMapMarkerAlt_3 = faMapMarkerAlt.prefix;
var faMapMarkerAlt_4 = faMapMarkerAlt.iconName;
var faMapMarkerAlt_5 = faMapMarkerAlt.width;
var faMapMarkerAlt_6 = faMapMarkerAlt.height;
var faMapMarkerAlt_7 = faMapMarkerAlt.ligatures;
var faMapMarkerAlt_8 = faMapMarkerAlt.unicode;
var faMapMarkerAlt_9 = faMapMarkerAlt.svgPathData;

var faSignOutAlt = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'sign-out-alt';
var width = 512;
var height = 512;
var ligatures = [];
var unicode = 'f2f5';
var svgPathData = 'M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faSignOutAlt = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faSignOutAlt);
var faSignOutAlt_1 = faSignOutAlt.definition;
var faSignOutAlt_2 = faSignOutAlt.faSignOutAlt;
var faSignOutAlt_3 = faSignOutAlt.prefix;
var faSignOutAlt_4 = faSignOutAlt.iconName;
var faSignOutAlt_5 = faSignOutAlt.width;
var faSignOutAlt_6 = faSignOutAlt.height;
var faSignOutAlt_7 = faSignOutAlt.ligatures;
var faSignOutAlt_8 = faSignOutAlt.unicode;
var faSignOutAlt_9 = faSignOutAlt.svgPathData;

var faThumbsUp = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'thumbs-up';
var width = 512;
var height = 512;
var ligatures = [];
var unicode = 'f164';
var svgPathData = 'M104 224H24c-13.255 0-24 10.745-24 24v240c0 13.255 10.745 24 24 24h80c13.255 0 24-10.745 24-24V248c0-13.255-10.745-24-24-24zM64 472c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24zM384 81.452c0 42.416-25.97 66.208-33.277 94.548h101.723c33.397 0 59.397 27.746 59.553 58.098.084 17.938-7.546 37.249-19.439 49.197l-.11.11c9.836 23.337 8.237 56.037-9.308 79.469 8.681 25.895-.069 57.704-16.382 74.757 4.298 17.598 2.244 32.575-6.148 44.632C440.202 511.587 389.616 512 346.839 512l-2.845-.001c-48.287-.017-87.806-17.598-119.56-31.725-15.957-7.099-36.821-15.887-52.651-16.178-6.54-.12-11.783-5.457-11.783-11.998v-213.77c0-3.2 1.282-6.271 3.558-8.521 39.614-39.144 56.648-80.587 89.117-113.111 14.804-14.832 20.188-37.236 25.393-58.902C282.515 39.293 291.817 0 312 0c24 0 72 8 72 81.452z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faThumbsUp = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faThumbsUp);
var faThumbsUp_1 = faThumbsUp.definition;
var faThumbsUp_2 = faThumbsUp.faThumbsUp;
var faThumbsUp_3 = faThumbsUp.prefix;
var faThumbsUp_4 = faThumbsUp.iconName;
var faThumbsUp_5 = faThumbsUp.width;
var faThumbsUp_6 = faThumbsUp.height;
var faThumbsUp_7 = faThumbsUp.ligatures;
var faThumbsUp_8 = faThumbsUp.unicode;
var faThumbsUp_9 = faThumbsUp.svgPathData;

var faHeart = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'heart';
var width = 512;
var height = 512;
var ligatures = [];
var unicode = 'f004';
var svgPathData = 'M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faHeart = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faHeart);
var faHeart_1 = faHeart.definition;
var faHeart_2 = faHeart.faHeart;
var faHeart_3 = faHeart.prefix;
var faHeart_4 = faHeart.iconName;
var faHeart_5 = faHeart.width;
var faHeart_6 = faHeart.height;
var faHeart_7 = faHeart.ligatures;
var faHeart_8 = faHeart.unicode;
var faHeart_9 = faHeart.svgPathData;

var faLink = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'link';
var width = 512;
var height = 512;
var ligatures = [];
var unicode = 'f0c1';
var svgPathData = 'M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faLink = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faLink);
var faLink_1 = faLink.definition;
var faLink_2 = faLink.faLink;
var faLink_3 = faLink.prefix;
var faLink_4 = faLink.iconName;
var faLink_5 = faLink.width;
var faLink_6 = faLink.height;
var faLink_7 = faLink.ligatures;
var faLink_8 = faLink.unicode;
var faLink_9 = faLink.svgPathData;

var faShareAlt = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'share-alt';
var width = 448;
var height = 512;
var ligatures = [];
var unicode = 'f1e0';
var svgPathData = 'M352 320c-22.608 0-43.387 7.819-59.79 20.895l-102.486-64.054a96.551 96.551 0 0 0 0-41.683l102.486-64.054C308.613 184.181 329.392 192 352 192c53.019 0 96-42.981 96-96S405.019 0 352 0s-96 42.981-96 96c0 7.158.79 14.13 2.276 20.841L155.79 180.895C139.387 167.819 118.608 160 96 160c-53.019 0-96 42.981-96 96s42.981 96 96 96c22.608 0 43.387-7.819 59.79-20.895l102.486 64.054A96.301 96.301 0 0 0 256 416c0 53.019 42.981 96 96 96s96-42.981 96-96-42.981-96-96-96z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faShareAlt = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faShareAlt);
var faShareAlt_1 = faShareAlt.definition;
var faShareAlt_2 = faShareAlt.faShareAlt;
var faShareAlt_3 = faShareAlt.prefix;
var faShareAlt_4 = faShareAlt.iconName;
var faShareAlt_5 = faShareAlt.width;
var faShareAlt_6 = faShareAlt.height;
var faShareAlt_7 = faShareAlt.ligatures;
var faShareAlt_8 = faShareAlt.unicode;
var faShareAlt_9 = faShareAlt.svgPathData;

var faHandHoldingUsd = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'hand-holding-usd';
var width = 576;
var height = 512;
var ligatures = [];
var unicode = 'f4c0';
var svgPathData = 'M271.06,144.3l54.27,14.3a8.59,8.59,0,0,1,6.63,8.1c0,4.6-4.09,8.4-9.12,8.4h-35.6a30,30,0,0,1-11.19-2.2c-5.24-2.2-11.28-1.7-15.3,2l-19,17.5a11.68,11.68,0,0,0-2.25,2.66,11.42,11.42,0,0,0,3.88,15.74,83.77,83.77,0,0,0,34.51,11.5V240c0,8.8,7.83,16,17.37,16h17.37c9.55,0,17.38-7.2,17.38-16V222.4c32.93-3.6,57.84-31,53.5-63-3.15-23-22.46-41.3-46.56-47.7L282.68,97.4a8.59,8.59,0,0,1-6.63-8.1c0-4.6,4.09-8.4,9.12-8.4h35.6A30,30,0,0,1,332,83.1c5.23,2.2,11.28,1.7,15.3-2l19-17.5A11.31,11.31,0,0,0,368.47,61a11.43,11.43,0,0,0-3.84-15.78,83.82,83.82,0,0,0-34.52-11.5V16c0-8.8-7.82-16-17.37-16H295.37C285.82,0,278,7.2,278,16V33.6c-32.89,3.6-57.85,31-53.51,63C227.63,119.6,247,137.9,271.06,144.3ZM565.27,328.1c-11.8-10.7-30.2-10-42.6,0L430.27,402a63.64,63.64,0,0,1-40,14H272a16,16,0,0,1,0-32h78.29c15.9,0,30.71-10.9,33.25-26.6a31.2,31.2,0,0,0,.46-5.46A32,32,0,0,0,352,320H192a117.66,117.66,0,0,0-74.1,26.29L71.4,384H16A16,16,0,0,0,0,400v96a16,16,0,0,0,16,16H372.77a64,64,0,0,0,40-14L564,377a32,32,0,0,0,1.28-48.9Z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faHandHoldingUsd = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faHandHoldingUsd);
var faHandHoldingUsd_1 = faHandHoldingUsd.definition;
var faHandHoldingUsd_2 = faHandHoldingUsd.faHandHoldingUsd;
var faHandHoldingUsd_3 = faHandHoldingUsd.prefix;
var faHandHoldingUsd_4 = faHandHoldingUsd.iconName;
var faHandHoldingUsd_5 = faHandHoldingUsd.width;
var faHandHoldingUsd_6 = faHandHoldingUsd.height;
var faHandHoldingUsd_7 = faHandHoldingUsd.ligatures;
var faHandHoldingUsd_8 = faHandHoldingUsd.unicode;
var faHandHoldingUsd_9 = faHandHoldingUsd.svgPathData;

var faMapMarkedAlt = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'map-marked-alt';
var width = 576;
var height = 512;
var ligatures = [];
var unicode = 'f5a0';
var svgPathData = 'M288 0c-69.59 0-126 56.41-126 126 0 56.26 82.35 158.8 113.9 196.02 6.39 7.54 17.82 7.54 24.2 0C331.65 284.8 414 182.26 414 126 414 56.41 357.59 0 288 0zm0 168c-23.2 0-42-18.8-42-42s18.8-42 42-42 42 18.8 42 42-18.8 42-42 42zM20.12 215.95A32.006 32.006 0 0 0 0 245.66v250.32c0 11.32 11.43 19.06 21.94 14.86L160 448V214.92c-8.84-15.98-16.07-31.54-21.25-46.42L20.12 215.95zM288 359.67c-14.07 0-27.38-6.18-36.51-16.96-19.66-23.2-40.57-49.62-59.49-76.72v182l192 64V266c-18.92 27.09-39.82 53.52-59.49 76.72-9.13 10.77-22.44 16.95-36.51 16.95zm266.06-198.51L416 224v288l139.88-55.95A31.996 31.996 0 0 0 576 426.34V176.02c0-11.32-11.43-19.06-21.94-14.86z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faMapMarkedAlt = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faMapMarkedAlt);
var faMapMarkedAlt_1 = faMapMarkedAlt.definition;
var faMapMarkedAlt_2 = faMapMarkedAlt.faMapMarkedAlt;
var faMapMarkedAlt_3 = faMapMarkedAlt.prefix;
var faMapMarkedAlt_4 = faMapMarkedAlt.iconName;
var faMapMarkedAlt_5 = faMapMarkedAlt.width;
var faMapMarkedAlt_6 = faMapMarkedAlt.height;
var faMapMarkedAlt_7 = faMapMarkedAlt.ligatures;
var faMapMarkedAlt_8 = faMapMarkedAlt.unicode;
var faMapMarkedAlt_9 = faMapMarkedAlt.svgPathData;

var faEnvelope = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'envelope';
var width = 512;
var height = 512;
var ligatures = [];
var unicode = 'f0e0';
var svgPathData = 'M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faEnvelope = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faEnvelope);
var faEnvelope_1 = faEnvelope.definition;
var faEnvelope_2 = faEnvelope.faEnvelope;
var faEnvelope_3 = faEnvelope.prefix;
var faEnvelope_4 = faEnvelope.iconName;
var faEnvelope_5 = faEnvelope.width;
var faEnvelope_6 = faEnvelope.height;
var faEnvelope_7 = faEnvelope.ligatures;
var faEnvelope_8 = faEnvelope.unicode;
var faEnvelope_9 = faEnvelope.svgPathData;

var faEye = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'eye';
var width = 576;
var height = 512;
var ligatures = [];
var unicode = 'f06e';
var svgPathData = 'M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faEye = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faEye);
var faEye_1 = faEye.definition;
var faEye_2 = faEye.faEye;
var faEye_3 = faEye.prefix;
var faEye_4 = faEye.iconName;
var faEye_5 = faEye.width;
var faEye_6 = faEye.height;
var faEye_7 = faEye.ligatures;
var faEye_8 = faEye.unicode;
var faEye_9 = faEye.svgPathData;

var faEyeSlash = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'eye-slash';
var width = 640;
var height = 512;
var ligatures = [];
var unicode = 'f070';
var svgPathData = 'M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faEyeSlash = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faEyeSlash);
var faEyeSlash_1 = faEyeSlash.definition;
var faEyeSlash_2 = faEyeSlash.faEyeSlash;
var faEyeSlash_3 = faEyeSlash.prefix;
var faEyeSlash_4 = faEyeSlash.iconName;
var faEyeSlash_5 = faEyeSlash.width;
var faEyeSlash_6 = faEyeSlash.height;
var faEyeSlash_7 = faEyeSlash.ligatures;
var faEyeSlash_8 = faEyeSlash.unicode;
var faEyeSlash_9 = faEyeSlash.svgPathData;

/* node_modules/svelte-loading-spinners/src/Circle3.svelte generated by Svelte v3.21.0 */

const file$5 = "node_modules/svelte-loading-spinners/src/Circle3.svelte";

function add_css$1() {
	var style = element("style");
	style.id = "svelte-9kagi3-style";
	style.textContent = ".spinner.svelte-9kagi3{display:flex;justify-content:center;align-items:center}.svelte-9kagi3{line-height:0;box-sizing:border-box}.ball-container.svelte-9kagi3{-webkit-animation:svelte-9kagi3-animball_two 1.5s infinite;animation:svelte-9kagi3-animball_two 1.5s infinite;width:44px;height:44px;flex-shrink:0;position:relative}.contener_mixte.svelte-9kagi3{width:44px;height:44px;position:absolute}.ballcolor.svelte-9kagi3{width:20px;height:20px;border-radius:50%}.ball_1.svelte-9kagi3,.ball_2.svelte-9kagi3,.ball_3.svelte-9kagi3,.ball_4.svelte-9kagi3{position:absolute;-webkit-animation:svelte-9kagi3-animball_one 1.5s infinite ease;animation:svelte-9kagi3-animball_one 1.5s infinite ease}.ball_1.svelte-9kagi3{background-color:#ff3e00;top:0;left:0}.ball_2.svelte-9kagi3{background-color:#f8b334;top:0;left:24px}.ball_3.svelte-9kagi3{background-color:#40b3ff;top:24px;left:0}.ball_4.svelte-9kagi3{background-color:#676778;top:24px;left:24px}@-webkit-keyframes svelte-9kagi3-animball_one{0%{position:absolute}50%{top:12px;left:12px;position:absolute;opacity:0.5}100%{position:absolute}}@keyframes svelte-9kagi3-animball_one{0%{position:absolute}50%{top:12px;left:12px;position:absolute;opacity:0.5}100%{position:absolute}}@-webkit-keyframes svelte-9kagi3-animball_two{0%{transform:rotate(0deg) scale(1)}50%{transform:rotate(360deg) scale(1.3)}100%{transform:rotate(720deg) scale(1)}}@keyframes svelte-9kagi3-animball_two{0%{transform:rotate(0deg) scale(1)}50%{transform:rotate(360deg) scale(1.3)}100%{transform:rotate(720deg) scale(1)}}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2lyY2xlMy5zdmVsdGUiLCJzb3VyY2VzIjpbIkNpcmNsZTMuc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XHJcbiAgZXhwb3J0IGxldCBzaXplID0gXCI0MHB4XCI7XHJcbiAgJDogc3R5bGVzID0gW2B3aWR0aDogJHtzaXplfWAsIGBoZWlnaHQ6ICR7c2l6ZX1gXS5qb2luKFwiO1wiKTtcclxuICAkOiBpbm5lclN0eWxlcyA9IFtcclxuICAgIGB0cmFuc2Zvcm06ICdzY2FsZSgnICsgKCR7cGFyc2VJbnQoc2l6ZSkgLyA0NH0pICsgJyknYFxyXG4gIF0uam9pbihcIjtcIik7XHJcbjwvc2NyaXB0PlxyXG5cclxuPGRpdiBzdHlsZT1cIntzdHlsZXN9XCIgY2xhc3M9XCJzcGlubmVyIHNwaW5uZXItLWNpcmNsZS04XCI+XHJcbiAgPGRpdiBzdHlsZT1cIntpbm5lclN0eWxlc31cIiBjbGFzcz1cInNwaW5uZXItaW5uZXJcIj5cclxuICAgIDxkaXYgY2xhc3M9XCJiYWxsLWNvbnRhaW5lclwiPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiY29udGVuZXJfbWl4dGVcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiYmFsbGNvbG9yIGJhbGxfMVwiPiZuYnNwOzwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbmVyX21peHRlXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImJhbGxjb2xvciBiYWxsXzJcIj4mbmJzcDs8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJjb250ZW5lcl9taXh0ZVwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJiYWxsY29sb3IgYmFsbF8zXCI+Jm5ic3A7PC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiY29udGVuZXJfbWl4dGVcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiYmFsbGNvbG9yIGJhbGxfNFwiPiZuYnNwOzwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gIDwvZGl2PlxyXG48L2Rpdj5cclxuPHN0eWxlPlxyXG4uc3Bpbm5lciB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG59XHJcbioge1xyXG4gIGxpbmUtaGVpZ2h0OiAwO1xyXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XHJcbn1cclxuLmJhbGwtY29udGFpbmVyIHtcclxuICAtd2Via2l0LWFuaW1hdGlvbjogYW5pbWJhbGxfdHdvIDEuNXMgaW5maW5pdGU7XHJcbiAgICAgICAgICBhbmltYXRpb246IGFuaW1iYWxsX3R3byAxLjVzIGluZmluaXRlO1xyXG4gIHdpZHRoOiA0NHB4O1xyXG4gIGhlaWdodDogNDRweDtcclxuICBmbGV4LXNocmluazogMDtcclxuICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbn1cclxuLmNvbnRlbmVyX21peHRlIHtcclxuICB3aWR0aDogNDRweDtcclxuICBoZWlnaHQ6IDQ0cHg7XHJcbiAgcG9zaXRpb246IGFic29sdXRlO1xyXG59XHJcbi5iYWxsY29sb3Ige1xyXG4gIHdpZHRoOiAyMHB4O1xyXG4gIGhlaWdodDogMjBweDtcclxuICBib3JkZXItcmFkaXVzOiA1MCU7XHJcbn1cclxuLmJhbGxfMSxcclxuLmJhbGxfMixcclxuLmJhbGxfMyxcclxuLmJhbGxfNCB7XHJcbiAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBhbmltYmFsbF9vbmUgMS41cyBpbmZpbml0ZSBlYXNlO1xyXG4gICAgICAgICAgYW5pbWF0aW9uOiBhbmltYmFsbF9vbmUgMS41cyBpbmZpbml0ZSBlYXNlO1xyXG59XHJcbi5iYWxsXzEge1xyXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZjNlMDA7XHJcbiAgdG9wOiAwO1xyXG4gIGxlZnQ6IDA7XHJcbn1cclxuLmJhbGxfMiB7XHJcbiAgYmFja2dyb3VuZC1jb2xvcjogI2Y4YjMzNDtcclxuICB0b3A6IDA7XHJcbiAgbGVmdDogMjRweDtcclxufVxyXG4uYmFsbF8zIHtcclxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDBiM2ZmO1xyXG4gIHRvcDogMjRweDtcclxuICBsZWZ0OiAwO1xyXG59XHJcbi5iYWxsXzQge1xyXG4gIGJhY2tncm91bmQtY29sb3I6ICM2NzY3Nzg7XHJcbiAgdG9wOiAyNHB4O1xyXG4gIGxlZnQ6IDI0cHg7XHJcbn1cclxuQC13ZWJraXQta2V5ZnJhbWVzIGFuaW1iYWxsX29uZSB7XHJcbiAgMCUge1xyXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gIH1cclxuICA1MCUge1xyXG4gICAgdG9wOiAxMnB4O1xyXG4gICAgbGVmdDogMTJweDtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIG9wYWNpdHk6IDAuNTtcclxuICB9XHJcbiAgMTAwJSB7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgfVxyXG59XHJcbkBrZXlmcmFtZXMgYW5pbWJhbGxfb25lIHtcclxuICAwJSB7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgfVxyXG4gIDUwJSB7XHJcbiAgICB0b3A6IDEycHg7XHJcbiAgICBsZWZ0OiAxMnB4O1xyXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgb3BhY2l0eTogMC41O1xyXG4gIH1cclxuICAxMDAlIHtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICB9XHJcbn1cclxuQC13ZWJraXQta2V5ZnJhbWVzIGFuaW1iYWxsX3R3byB7XHJcbiAgMCUge1xyXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZykgc2NhbGUoMSk7XHJcbiAgfVxyXG4gIDUwJSB7XHJcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpIHNjYWxlKDEuMyk7XHJcbiAgfVxyXG4gIDEwMCUge1xyXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoNzIwZGVnKSBzY2FsZSgxKTtcclxuICB9XHJcbn1cclxuQGtleWZyYW1lcyBhbmltYmFsbF90d28ge1xyXG4gIDAlIHtcclxuICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpIHNjYWxlKDEpO1xyXG4gIH1cclxuICA1MCUge1xyXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKSBzY2FsZSgxLjMpO1xyXG4gIH1cclxuICAxMDAlIHtcclxuICAgIHRyYW5zZm9ybTogcm90YXRlKDcyMGRlZykgc2NhbGUoMSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW01dlpHVmZiVzlrZFd4bGN5OXpkbVZzZEdVdGJHOWhaR2x1WnkxemNHbHVibVZ5Y3k5emNtTXZRMmx5WTJ4bE15NXpkbVZzZEdVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVTkJPMFZCUTBVc1lVRkJZVHRGUVVOaUxIVkNRVUYxUWp0RlFVTjJRaXh0UWtGQmJVSTdRVUZEY2tJN1FVRkRRVHRGUVVORkxHTkJRV003UlVGRFpDeHpRa0ZCYzBJN1FVRkRlRUk3UVVGRFFUdEZRVU5GTERaRFFVRnhRenRWUVVGeVF5eHhRMEZCY1VNN1JVRkRja01zVjBGQlZ6dEZRVU5ZTEZsQlFWazdSVUZEV2l4alFVRmpPMFZCUTJRc2EwSkJRV3RDTzBGQlEzQkNPMEZCUTBFN1JVRkRSU3hYUVVGWE8wVkJRMWdzV1VGQldUdEZRVU5hTEd0Q1FVRnJRanRCUVVOd1FqdEJRVU5CTzBWQlEwVXNWMEZCVnp0RlFVTllMRmxCUVZrN1JVRkRXaXhyUWtGQmEwSTdRVUZEY0VJN1FVRkRRVHM3T3p0RlFVbEZMR3RDUVVGclFqdEZRVU5zUWl4clJFRkJNRU03VlVGQk1VTXNNRU5CUVRCRE8wRkJRelZETzBGQlEwRTdSVUZEUlN4NVFrRkJlVUk3UlVGRGVrSXNUVUZCVFR0RlFVTk9MRTlCUVU4N1FVRkRWRHRCUVVOQk8wVkJRMFVzZVVKQlFYbENPMFZCUTNwQ0xFMUJRVTA3UlVGRFRpeFZRVUZWTzBGQlExbzdRVUZEUVR0RlFVTkZMSGxDUVVGNVFqdEZRVU42UWl4VFFVRlRPMFZCUTFRc1QwRkJUenRCUVVOVU8wRkJRMEU3UlVGRFJTeDVRa0ZCZVVJN1JVRkRla0lzVTBGQlV6dEZRVU5VTEZWQlFWVTdRVUZEV2p0QlFVTkJPMFZCUTBVN1NVRkRSU3hyUWtGQmEwSTdSVUZEY0VJN1JVRkRRVHRKUVVORkxGTkJRVk03U1VGRFZDeFZRVUZWTzBsQlExWXNhMEpCUVd0Q08wbEJRMnhDTEZsQlFWazdSVUZEWkR0RlFVTkJPMGxCUTBVc2EwSkJRV3RDTzBWQlEzQkNPMEZCUTBZN1FVRmlRVHRGUVVORk8wbEJRMFVzYTBKQlFXdENPMFZCUTNCQ08wVkJRMEU3U1VGRFJTeFRRVUZUTzBsQlExUXNWVUZCVlR0SlFVTldMR3RDUVVGclFqdEpRVU5zUWl4WlFVRlpPMFZCUTJRN1JVRkRRVHRKUVVORkxHdENRVUZyUWp0RlFVTndRanRCUVVOR08wRkJRMEU3UlVGRFJUdEpRVU5GTEdkRFFVRm5RenRGUVVOc1F6dEZRVU5CTzBsQlEwVXNiME5CUVc5RE8wVkJRM1JETzBWQlEwRTdTVUZEUlN4clEwRkJhME03UlVGRGNFTTdRVUZEUmp0QlFWWkJPMFZCUTBVN1NVRkRSU3huUTBGQlowTTdSVUZEYkVNN1JVRkRRVHRKUVVORkxHOURRVUZ2UXp0RlFVTjBRenRGUVVOQk8wbEJRMFVzYTBOQlFXdERPMFZCUTNCRE8wRkJRMFlpTENKbWFXeGxJam9pYm05a1pWOXRiMlIxYkdWekwzTjJaV3gwWlMxc2IyRmthVzVuTFhOd2FXNXVaWEp6TDNOeVl5OURhWEpqYkdVekxuTjJaV3gwWlNJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYklseHlYRzR1YzNCcGJtNWxjaUI3WEhKY2JpQWdaR2x6Y0d4aGVUb2dabXhsZUR0Y2NseHVJQ0JxZFhOMGFXWjVMV052Ym5SbGJuUTZJR05sYm5SbGNqdGNjbHh1SUNCaGJHbG5iaTFwZEdWdGN6b2dZMlZ1ZEdWeU8xeHlYRzU5WEhKY2Jpb2dlMXh5WEc0Z0lHeHBibVV0YUdWcFoyaDBPaUF3TzF4eVhHNGdJR0p2ZUMxemFYcHBibWM2SUdKdmNtUmxjaTFpYjNnN1hISmNibjFjY2x4dUxtSmhiR3d0WTI5dWRHRnBibVZ5SUh0Y2NseHVJQ0JoYm1sdFlYUnBiMjQ2SUdGdWFXMWlZV3hzWDNSM2J5QXhMalZ6SUdsdVptbHVhWFJsTzF4eVhHNGdJSGRwWkhSb09pQTBOSEI0TzF4eVhHNGdJR2hsYVdkb2REb2dORFJ3ZUR0Y2NseHVJQ0JtYkdWNExYTm9jbWx1YXpvZ01EdGNjbHh1SUNCd2IzTnBkR2x2YmpvZ2NtVnNZWFJwZG1VN1hISmNibjFjY2x4dUxtTnZiblJsYm1WeVgyMXBlSFJsSUh0Y2NseHVJQ0IzYVdSMGFEb2dORFJ3ZUR0Y2NseHVJQ0JvWldsbmFIUTZJRFEwY0hnN1hISmNiaUFnY0c5emFYUnBiMjQ2SUdGaWMyOXNkWFJsTzF4eVhHNTlYSEpjYmk1aVlXeHNZMjlzYjNJZ2UxeHlYRzRnSUhkcFpIUm9PaUF5TUhCNE8xeHlYRzRnSUdobGFXZG9kRG9nTWpCd2VEdGNjbHh1SUNCaWIzSmtaWEl0Y21Ga2FYVnpPaUExTUNVN1hISmNibjFjY2x4dUxtSmhiR3hmTVN4Y2NseHVMbUpoYkd4Zk1peGNjbHh1TG1KaGJHeGZNeXhjY2x4dUxtSmhiR3hmTkNCN1hISmNiaUFnY0c5emFYUnBiMjQ2SUdGaWMyOXNkWFJsTzF4eVhHNGdJR0Z1YVcxaGRHbHZiam9nWVc1cGJXSmhiR3hmYjI1bElERXVOWE1nYVc1bWFXNXBkR1VnWldGelpUdGNjbHh1ZlZ4eVhHNHVZbUZzYkY4eElIdGNjbHh1SUNCaVlXTnJaM0p2ZFc1a0xXTnZiRzl5T2lBalptWXpaVEF3TzF4eVhHNGdJSFJ2Y0RvZ01EdGNjbHh1SUNCc1pXWjBPaUF3TzF4eVhHNTlYSEpjYmk1aVlXeHNYeklnZTF4eVhHNGdJR0poWTJ0bmNtOTFibVF0WTI5c2IzSTZJQ05tT0dJek16UTdYSEpjYmlBZ2RHOXdPaUF3TzF4eVhHNGdJR3hsWm5RNklESTBjSGc3WEhKY2JuMWNjbHh1TG1KaGJHeGZNeUI3WEhKY2JpQWdZbUZqYTJkeWIzVnVaQzFqYjJ4dmNqb2dJelF3WWpObVpqdGNjbHh1SUNCMGIzQTZJREkwY0hnN1hISmNiaUFnYkdWbWREb2dNRHRjY2x4dWZWeHlYRzR1WW1Gc2JGODBJSHRjY2x4dUlDQmlZV05yWjNKdmRXNWtMV052Ykc5eU9pQWpOamMyTnpjNE8xeHlYRzRnSUhSdmNEb2dNalJ3ZUR0Y2NseHVJQ0JzWldaME9pQXlOSEI0TzF4eVhHNTlYSEpjYmtCclpYbG1jbUZ0WlhNZ1lXNXBiV0poYkd4ZmIyNWxJSHRjY2x4dUlDQXdKU0I3WEhKY2JpQWdJQ0J3YjNOcGRHbHZiam9nWVdKemIyeDFkR1U3WEhKY2JpQWdmVnh5WEc0Z0lEVXdKU0I3WEhKY2JpQWdJQ0IwYjNBNklERXljSGc3WEhKY2JpQWdJQ0JzWldaME9pQXhNbkI0TzF4eVhHNGdJQ0FnY0c5emFYUnBiMjQ2SUdGaWMyOXNkWFJsTzF4eVhHNGdJQ0FnYjNCaFkybDBlVG9nTUM0MU8xeHlYRzRnSUgxY2NseHVJQ0F4TURBbElIdGNjbHh1SUNBZ0lIQnZjMmwwYVc5dU9pQmhZbk52YkhWMFpUdGNjbHh1SUNCOVhISmNibjFjY2x4dVFHdGxlV1p5WVcxbGN5QmhibWx0WW1Gc2JGOTBkMjhnZTF4eVhHNGdJREFsSUh0Y2NseHVJQ0FnSUhSeVlXNXpabTl5YlRvZ2NtOTBZWFJsS0RCa1pXY3BJSE5qWVd4bEtERXBPMXh5WEc0Z0lIMWNjbHh1SUNBMU1DVWdlMXh5WEc0Z0lDQWdkSEpoYm5ObWIzSnRPaUJ5YjNSaGRHVW9Nell3WkdWbktTQnpZMkZzWlNneExqTXBPMXh5WEc0Z0lIMWNjbHh1SUNBeE1EQWxJSHRjY2x4dUlDQWdJSFJ5WVc1elptOXliVG9nY205MFlYUmxLRGN5TUdSbFp5a2djMk5oYkdVb01TazdYSEpjYmlBZ2ZWeHlYRzU5WEhKY2JpSmRmUT09ICovPC9zdHlsZT5cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTJCQSxRQUFRLGNBQUMsQ0FBQyxBQUNSLE9BQU8sQ0FBRSxJQUFJLENBQ2IsZUFBZSxDQUFFLE1BQU0sQ0FDdkIsV0FBVyxDQUFFLE1BQU0sQUFDckIsQ0FBQyxBQUNELGNBQUUsQ0FBQyxBQUNELFdBQVcsQ0FBRSxDQUFDLENBQ2QsVUFBVSxDQUFFLFVBQVUsQUFDeEIsQ0FBQyxBQUNELGVBQWUsY0FBQyxDQUFDLEFBQ2YsaUJBQWlCLENBQUUsMEJBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUNyQyxTQUFTLENBQUUsMEJBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUM3QyxLQUFLLENBQUUsSUFBSSxDQUNYLE1BQU0sQ0FBRSxJQUFJLENBQ1osV0FBVyxDQUFFLENBQUMsQ0FDZCxRQUFRLENBQUUsUUFBUSxBQUNwQixDQUFDLEFBQ0QsZUFBZSxjQUFDLENBQUMsQUFDZixLQUFLLENBQUUsSUFBSSxDQUNYLE1BQU0sQ0FBRSxJQUFJLENBQ1osUUFBUSxDQUFFLFFBQVEsQUFDcEIsQ0FBQyxBQUNELFVBQVUsY0FBQyxDQUFDLEFBQ1YsS0FBSyxDQUFFLElBQUksQ0FDWCxNQUFNLENBQUUsSUFBSSxDQUNaLGFBQWEsQ0FBRSxHQUFHLEFBQ3BCLENBQUMsQUFDRCxxQkFBTyxDQUNQLHFCQUFPLENBQ1AscUJBQU8sQ0FDUCxPQUFPLGNBQUMsQ0FBQyxBQUNQLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLGlCQUFpQixDQUFFLDBCQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQzFDLFNBQVMsQ0FBRSwwQkFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxBQUNwRCxDQUFDLEFBQ0QsT0FBTyxjQUFDLENBQUMsQUFDUCxnQkFBZ0IsQ0FBRSxPQUFPLENBQ3pCLEdBQUcsQ0FBRSxDQUFDLENBQ04sSUFBSSxDQUFFLENBQUMsQUFDVCxDQUFDLEFBQ0QsT0FBTyxjQUFDLENBQUMsQUFDUCxnQkFBZ0IsQ0FBRSxPQUFPLENBQ3pCLEdBQUcsQ0FBRSxDQUFDLENBQ04sSUFBSSxDQUFFLElBQUksQUFDWixDQUFDLEFBQ0QsT0FBTyxjQUFDLENBQUMsQUFDUCxnQkFBZ0IsQ0FBRSxPQUFPLENBQ3pCLEdBQUcsQ0FBRSxJQUFJLENBQ1QsSUFBSSxDQUFFLENBQUMsQUFDVCxDQUFDLEFBQ0QsT0FBTyxjQUFDLENBQUMsQUFDUCxnQkFBZ0IsQ0FBRSxPQUFPLENBQ3pCLEdBQUcsQ0FBRSxJQUFJLENBQ1QsSUFBSSxDQUFFLElBQUksQUFDWixDQUFDLEFBQ0QsbUJBQW1CLDBCQUFhLENBQUMsQUFDL0IsRUFBRSxBQUFDLENBQUMsQUFDRixRQUFRLENBQUUsUUFBUSxBQUNwQixDQUFDLEFBQ0QsR0FBRyxBQUFDLENBQUMsQUFDSCxHQUFHLENBQUUsSUFBSSxDQUNULElBQUksQ0FBRSxJQUFJLENBQ1YsUUFBUSxDQUFFLFFBQVEsQ0FDbEIsT0FBTyxDQUFFLEdBQUcsQUFDZCxDQUFDLEFBQ0QsSUFBSSxBQUFDLENBQUMsQUFDSixRQUFRLENBQUUsUUFBUSxBQUNwQixDQUFDLEFBQ0gsQ0FBQyxBQUNELFdBQVcsMEJBQWEsQ0FBQyxBQUN2QixFQUFFLEFBQUMsQ0FBQyxBQUNGLFFBQVEsQ0FBRSxRQUFRLEFBQ3BCLENBQUMsQUFDRCxHQUFHLEFBQUMsQ0FBQyxBQUNILEdBQUcsQ0FBRSxJQUFJLENBQ1QsSUFBSSxDQUFFLElBQUksQ0FDVixRQUFRLENBQUUsUUFBUSxDQUNsQixPQUFPLENBQUUsR0FBRyxBQUNkLENBQUMsQUFDRCxJQUFJLEFBQUMsQ0FBQyxBQUNKLFFBQVEsQ0FBRSxRQUFRLEFBQ3BCLENBQUMsQUFDSCxDQUFDLEFBQ0QsbUJBQW1CLDBCQUFhLENBQUMsQUFDL0IsRUFBRSxBQUFDLENBQUMsQUFDRixTQUFTLENBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxBQUNsQyxDQUFDLEFBQ0QsR0FBRyxBQUFDLENBQUMsQUFDSCxTQUFTLENBQUUsT0FBTyxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUN0QyxDQUFDLEFBQ0QsSUFBSSxBQUFDLENBQUMsQUFDSixTQUFTLENBQUUsT0FBTyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxBQUNwQyxDQUFDLEFBQ0gsQ0FBQyxBQUNELFdBQVcsMEJBQWEsQ0FBQyxBQUN2QixFQUFFLEFBQUMsQ0FBQyxBQUNGLFNBQVMsQ0FBRSxPQUFPLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEFBQ2xDLENBQUMsQUFDRCxHQUFHLEFBQUMsQ0FBQyxBQUNILFNBQVMsQ0FBRSxPQUFPLE1BQU0sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEFBQ3RDLENBQUMsQUFDRCxJQUFJLEFBQUMsQ0FBQyxBQUNKLFNBQVMsQ0FBRSxPQUFPLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEFBQ3BDLENBQUMsQUFDSCxDQUFDIn0= */";
	append_dev(document.head, style);
}

function create_fragment$a(ctx) {
	let div10;
	let div9;
	let div8;
	let div1;
	let div0;
	let t1;
	let div3;
	let div2;
	let t3;
	let div5;
	let div4;
	let t5;
	let div7;
	let div6;

	const block = {
		c: function create() {
			div10 = element("div");
			div9 = element("div");
			div8 = element("div");
			div1 = element("div");
			div0 = element("div");
			div0.textContent = " ";
			t1 = space();
			div3 = element("div");
			div2 = element("div");
			div2.textContent = " ";
			t3 = space();
			div5 = element("div");
			div4 = element("div");
			div4.textContent = " ";
			t5 = space();
			div7 = element("div");
			div6 = element("div");
			div6.textContent = " ";
			attr_dev(div0, "class", "ballcolor ball_1 svelte-9kagi3");
			add_location(div0, file$5, 12, 8, 403);
			attr_dev(div1, "class", "contener_mixte svelte-9kagi3");
			add_location(div1, file$5, 11, 6, 365);
			attr_dev(div2, "class", "ballcolor ball_2 svelte-9kagi3");
			add_location(div2, file$5, 15, 8, 505);
			attr_dev(div3, "class", "contener_mixte svelte-9kagi3");
			add_location(div3, file$5, 14, 6, 467);
			attr_dev(div4, "class", "ballcolor ball_3 svelte-9kagi3");
			add_location(div4, file$5, 18, 8, 607);
			attr_dev(div5, "class", "contener_mixte svelte-9kagi3");
			add_location(div5, file$5, 17, 6, 569);
			attr_dev(div6, "class", "ballcolor ball_4 svelte-9kagi3");
			add_location(div6, file$5, 21, 8, 709);
			attr_dev(div7, "class", "contener_mixte svelte-9kagi3");
			add_location(div7, file$5, 20, 6, 671);
			attr_dev(div8, "class", "ball-container svelte-9kagi3");
			add_location(div8, file$5, 10, 4, 329);
			attr_dev(div9, "style", /*innerStyles*/ ctx[1]);
			attr_dev(div9, "class", "spinner-inner svelte-9kagi3");
			add_location(div9, file$5, 9, 2, 274);
			attr_dev(div10, "style", /*styles*/ ctx[0]);
			attr_dev(div10, "class", "spinner spinner--circle-8 svelte-9kagi3");
			add_location(div10, file$5, 8, 0, 214);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div10, anchor);
			append_dev(div10, div9);
			append_dev(div9, div8);
			append_dev(div8, div1);
			append_dev(div1, div0);
			append_dev(div8, t1);
			append_dev(div8, div3);
			append_dev(div3, div2);
			append_dev(div8, t3);
			append_dev(div8, div5);
			append_dev(div5, div4);
			append_dev(div8, t5);
			append_dev(div8, div7);
			append_dev(div7, div6);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*innerStyles*/ 2) {
				attr_dev(div9, "style", /*innerStyles*/ ctx[1]);
			}

			if (dirty & /*styles*/ 1) {
				attr_dev(div10, "style", /*styles*/ ctx[0]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div10);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$a.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$a($$self, $$props, $$invalidate) {
	let { size = "40px" } = $$props;
	const writable_props = ["size"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Circle3> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Circle3", $$slots, []);

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(2, size = $$props.size);
	};

	$$self.$capture_state = () => ({ size, styles, innerStyles });

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(2, size = $$props.size);
		if ("styles" in $$props) $$invalidate(0, styles = $$props.styles);
		if ("innerStyles" in $$props) $$invalidate(1, innerStyles = $$props.innerStyles);
	};

	let styles;
	let innerStyles;

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*size*/ 4) {
			 $$invalidate(0, styles = [`width: ${size}`, `height: ${size}`].join(";"));
		}

		if ($$self.$$.dirty & /*size*/ 4) {
			 $$invalidate(1, innerStyles = [`transform: 'scale(' + (${parseInt(size) / 44}) + ')'`].join(";"));
		}
	};

	return [styles, innerStyles, size];
}

class Circle3 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		if (!document.getElementById("svelte-9kagi3-style")) add_css$1();
		init(this, options, instance$a, create_fragment$a, safe_not_equal, { size: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Circle3",
			options,
			id: create_fragment$a.name
		});
	}

	get size() {
		throw new Error("<Circle3>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<Circle3>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/Spinner.svelte generated by Svelte v3.21.0 */
const file$6 = "src/components/Spinner.svelte";

function create_fragment$b(ctx) {
	let div;
	let current;

	const circle3 = new Circle3({
			props: { size: /*size*/ ctx[0] },
			$$inline: true
		});

	const block = {
		c: function create() {
			div = element("div");
			create_component(circle3.$$.fragment);
			set_style(div, "padding", "1em");
			add_location(div, file$6, 6, 0, 96);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(circle3, div, null);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const circle3_changes = {};
			if (dirty & /*size*/ 1) circle3_changes.size = /*size*/ ctx[0];
			circle3.$set(circle3_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(circle3.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(circle3.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(circle3);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$b.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$b($$self, $$props, $$invalidate) {
	let { size = 40 } = $$props;
	const writable_props = ["size"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spinner> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Spinner", $$slots, []);

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(0, size = $$props.size);
	};

	$$self.$capture_state = () => ({ Circle3, size });

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(0, size = $$props.size);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [size];
}

class Spinner extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$b, create_fragment$b, safe_not_equal, { size: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Spinner",
			options,
			id: create_fragment$b.name
		});
	}

	get size() {
		throw new Error("<Spinner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<Spinner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    url: 'https://howbusynow.com/finishSignUp',
    
    // This must be true.
    handleCodeInApp: true,
    iOS: {
        bundleId: 'io.implex.howbusy',
    },
    android: {
        packageName: 'io.implex.howbusy',
        installApp: true,
        minimumVersion: '28',
    },
    dynamicLinkDomain: 'howbusy.link'
};

/* src/components/SignUp.svelte generated by Svelte v3.21.0 */

const { console: console_1$1 } = globals;
const file$7 = "src/components/SignUp.svelte";

// (66:0) {:else}
function create_else_block$3(ctx) {
	let div;
	let promise;
	let div_intro;
	let current;

	let info = {
		ctx,
		current: null,
		token: null,
		pending: create_pending_block,
		then: create_then_block,
		catch: create_catch_block,
		value: 8,
		error: 9,
		blocks: [,,,]
	};

	handle_promise(promise = /*sent*/ ctx[2], info);

	const block = {
		c: function create() {
			div = element("div");
			info.block.c();
			add_location(div, file$7, 66, 1, 1395);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			info.block.m(div, info.anchor = null);
			info.mount = () => div;
			info.anchor = null;
			current = true;
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			info.ctx = ctx;

			if (dirty & /*sent*/ 4 && promise !== (promise = /*sent*/ ctx[2]) && handle_promise(promise, info)) ; else {
				const child_ctx = ctx.slice();
				child_ctx[8] = info.resolved;
				info.block.p(child_ctx, dirty);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(info.block);

			if (!div_intro) {
				add_render_callback(() => {
					div_intro = create_in_transition(div, fly, { x: -20, duration: 1000 });
					div_intro.start();
				});
			}

			current = true;
		},
		o: function outro(local) {
			for (let i = 0; i < 3; i += 1) {
				const block = info.blocks[i];
				transition_out(block);
			}

			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			info.block.d();
			info.token = null;
			info = null;
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block$3.name,
		type: "else",
		source: "(66:0) {:else}",
		ctx
	});

	return block;
}

// (43:0) {#if sent == null}
function create_if_block$6(ctx) {
	let form;
	let div1;
	let div0;
	let t0;
	let input;
	let input_class_value;
	let div0_class_value;
	let t1;
	let button_1;
	let t2;
	let button_1_class_value;
	let t3;
	let p;
	let t4;
	let form_intro;
	let current;
	let dispose;

	const icon = new Icon({
			props: {
				class: "" + (input_icon + " " + /*$themed*/ ctx[3].input_icon),
				data: faEnvelope_2
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			form = element("form");
			div1 = element("div");
			div0 = element("div");
			create_component(icon.$$.fragment);
			t0 = space();
			input = element("input");
			t1 = space();
			button_1 = element("button");
			t2 = text("Join in");
			t3 = space();
			p = element("p");
			t4 = text("Already helping out? Sign in instead.");
			attr_dev(input, "class", input_class_value = "" + (input_field + " " + /*$themed*/ ctx[3].input_field));
			attr_dev(input, "type", "email");
			attr_dev(input, "name", "email");
			attr_dev(input, "placeholder", "Email..");
			add_location(input, file$7, 50, 4, 1033);
			attr_dev(div0, "class", div0_class_value = "" + (flex_item + " " + f5 + " " + input_icons + " "));
			add_location(div0, file$7, 48, 3, 910);
			attr_dev(button_1, "class", button_1_class_value = "" + (flex_item + " " + f1 + " " + button + " " + /*$themed*/ ctx[3].button));
			add_location(button_1, file$7, 57, 3, 1192);
			attr_dev(div1, "class", flex_container);
			add_location(div1, file$7, 47, 2, 878);
			attr_dev(p, "class", link);
			add_location(p, file$7, 61, 2, 1288);
			add_location(form, file$7, 43, 1, 788);
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, form, anchor);
			append_dev(form, div1);
			append_dev(div1, div0);
			mount_component(icon, div0, null);
			append_dev(div0, t0);
			append_dev(div0, input);
			set_input_value(input, /*email*/ ctx[1]);
			append_dev(div1, t1);
			append_dev(div1, button_1);
			append_dev(button_1, t2);
			append_dev(form, t3);
			append_dev(form, p);
			append_dev(p, t4);
			current = true;
			if (remount) run_all(dispose);

			dispose = [
				listen_dev(input, "input", /*input_input_handler*/ ctx[7]),
				listen_dev(
					p,
					"click",
					function () {
						if (is_function(/*toggleSignUp*/ ctx[0])) /*toggleSignUp*/ ctx[0].apply(this, arguments);
					},
					false,
					false,
					false
				),
				listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[4]), false, true, false)
			];
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			const icon_changes = {};
			if (dirty & /*$themed*/ 8) icon_changes.class = "" + (input_icon + " " + /*$themed*/ ctx[3].input_icon);
			icon.$set(icon_changes);

			if (!current || dirty & /*$themed*/ 8 && input_class_value !== (input_class_value = "" + (input_field + " " + /*$themed*/ ctx[3].input_field))) {
				attr_dev(input, "class", input_class_value);
			}

			if (dirty & /*email*/ 2 && input.value !== /*email*/ ctx[1]) {
				set_input_value(input, /*email*/ ctx[1]);
			}

			if (!current || dirty & /*$themed*/ 8 && button_1_class_value !== (button_1_class_value = "" + (flex_item + " " + f1 + " " + button + " " + /*$themed*/ ctx[3].button))) {
				attr_dev(button_1, "class", button_1_class_value);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);

			if (!form_intro) {
				add_render_callback(() => {
					form_intro = create_in_transition(form, fly, { x: -20, duration: 1000 });
					form_intro.start();
				});
			}

			current = true;
		},
		o: function outro(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(form);
			destroy_component(icon);
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$6.name,
		type: "if",
		source: "(43:0) {#if sent == null}",
		ctx
	});

	return block;
}

// (77:2) {:catch error}
function create_catch_block(ctx) {
	let div;
	let span;
	let t0;
	let t1;
	let strong;
	let t3;
	let t4_value = /*error*/ ctx[9].message + "";
	let t4;
	let div_class_value;
	let div_intro;
	let dispose;

	const block = {
		c: function create() {
			div = element("div");
			span = element("span");
			t0 = text("×");
			t1 = space();
			strong = element("strong");
			strong.textContent = "Oh no!";
			t3 = text("\n\t\t\t\tSomthing went wrong - ");
			t4 = text(t4_value);
			attr_dev(span, "class", closebtn);
			add_location(span, file$7, 78, 4, 1748);
			add_location(strong, file$7, 79, 4, 1807);
			attr_dev(div, "class", div_class_value = "" + (alert + " "));
			add_location(div, file$7, 77, 3, 1713);
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, div, anchor);
			append_dev(div, span);
			append_dev(span, t0);
			append_dev(div, t1);
			append_dev(div, strong);
			append_dev(div, t3);
			append_dev(div, t4);
			if (remount) dispose();
			dispose = listen_dev(span, "click", /*reset*/ ctx[5], false, false, false);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*sent*/ 4 && t4_value !== (t4_value = /*error*/ ctx[9].message + "")) set_data_dev(t4, t4_value);
		},
		i: function intro(local) {
			if (!div_intro) {
				add_render_callback(() => {
					div_intro = create_in_transition(div, fade, {});
					div_intro.start();
				});
			}
		},
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_catch_block.name,
		type: "catch",
		source: "(77:2) {:catch error}",
		ctx
	});

	return block;
}

// (71:2) {:then result}
function create_then_block(ctx) {
	let div;
	let span;
	let t0;
	let t1;
	let strong;
	let t3;
	let t4;
	let t5;
	let div_class_value;
	let div_intro;
	let dispose;

	const block = {
		c: function create() {
			div = element("div");
			span = element("span");
			t0 = text("×");
			t1 = space();
			strong = element("strong");
			strong.textContent = "Thanks!";
			t3 = text("\n\t\t\t\tWe've sent an email to ");
			t4 = text(/*email*/ ctx[1]);
			t5 = text(" with further instructions ...");
			attr_dev(span, "class", closebtn);
			add_location(span, file$7, 72, 4, 1534);
			add_location(strong, file$7, 73, 4, 1593);
			attr_dev(div, "class", div_class_value = "" + (alert + " " + success));
			add_location(div, file$7, 71, 3, 1490);
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, div, anchor);
			append_dev(div, span);
			append_dev(span, t0);
			append_dev(div, t1);
			append_dev(div, strong);
			append_dev(div, t3);
			append_dev(div, t4);
			append_dev(div, t5);
			if (remount) dispose();
			dispose = listen_dev(span, "click", /*reset*/ ctx[5], false, false, false);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*email*/ 2) set_data_dev(t4, /*email*/ ctx[1]);
		},
		i: function intro(local) {
			if (!div_intro) {
				add_render_callback(() => {
					div_intro = create_in_transition(div, fade, {});
					div_intro.start();
				});
			}
		},
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_then_block.name,
		type: "then",
		source: "(71:2) {:then result}",
		ctx
	});

	return block;
}

// (69:15)     <Spinner  />   {:then result}
function create_pending_block(ctx) {
	let current;
	const spinner = new Spinner({ $$inline: true });

	const block = {
		c: function create() {
			create_component(spinner.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(spinner, target, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(spinner.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(spinner.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(spinner, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_pending_block.name,
		type: "pending",
		source: "(69:15)     <Spinner  />   {:then result}",
		ctx
	});

	return block;
}

function create_fragment$c(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$6, create_else_block$3];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*sent*/ ctx[2] == null) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$c.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$c($$self, $$props, $$invalidate) {
	let $themed;
	validate_store(themed, "themed");
	component_subscribe($$self, themed, $$value => $$invalidate(3, $themed = $$value));
	let { auth } = $$props;
	let { toggleSignUp } = $$props;
	let email = "";
	let sent = null;

	function handleSubmit(event) {
		console.log(event);
		console.log(event.target);
		console.log(event.target.email.value);
		$$invalidate(2, sent = auth.sendSignInLinkToEmail(email, actionCodeSettings));
	}

	function reset() {
		$$invalidate(2, sent = null);
		$$invalidate(1, email = null);
	}

	const writable_props = ["auth", "toggleSignUp"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<SignUp> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("SignUp", $$slots, []);

	function input_input_handler() {
		email = this.value;
		$$invalidate(1, email);
	}

	$$self.$set = $$props => {
		if ("auth" in $$props) $$invalidate(6, auth = $$props.auth);
		if ("toggleSignUp" in $$props) $$invalidate(0, toggleSignUp = $$props.toggleSignUp);
	};

	$$self.$capture_state = () => ({
		fade,
		fly,
		themed,
		flex_container,
		flex_item,
		f1,
		f5,
		input_icons,
		input_icon,
		input_field,
		button,
		link,
		alert,
		success,
		danger,
		closebtn,
		Icon,
		faEnvelope: faEnvelope_2,
		Spinner,
		actionCodeSettings,
		auth,
		toggleSignUp,
		email,
		sent,
		handleSubmit,
		reset,
		$themed
	});

	$$self.$inject_state = $$props => {
		if ("auth" in $$props) $$invalidate(6, auth = $$props.auth);
		if ("toggleSignUp" in $$props) $$invalidate(0, toggleSignUp = $$props.toggleSignUp);
		if ("email" in $$props) $$invalidate(1, email = $$props.email);
		if ("sent" in $$props) $$invalidate(2, sent = $$props.sent);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		toggleSignUp,
		email,
		sent,
		$themed,
		handleSubmit,
		reset,
		auth,
		input_input_handler
	];
}

class SignUp extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$c, create_fragment$c, safe_not_equal, { auth: 6, toggleSignUp: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "SignUp",
			options,
			id: create_fragment$c.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*auth*/ ctx[6] === undefined && !("auth" in props)) {
			console_1$1.warn("<SignUp> was created without expected prop 'auth'");
		}

		if (/*toggleSignUp*/ ctx[0] === undefined && !("toggleSignUp" in props)) {
			console_1$1.warn("<SignUp> was created without expected prop 'toggleSignUp'");
		}
	}

	get auth() {
		throw new Error("<SignUp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set auth(value) {
		throw new Error("<SignUp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get toggleSignUp() {
		throw new Error("<SignUp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set toggleSignUp(value) {
		throw new Error("<SignUp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/Input.svelte generated by Svelte v3.21.0 */
const file$8 = "src/components/Input.svelte";

function create_fragment$d(ctx) {
	let div;
	let span;
	let t;
	let input;
	let input_class_value;
	let div_class_value;
	let current;
	let dispose;

	const icon = new Icon({
			props: {
				class: "" + (input_icon + " " + /*$themed*/ ctx[5].input_icon),
				data: /*revealed*/ ctx[1] ? faEye_2 : faEyeSlash_2
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			div = element("div");
			span = element("span");
			create_component(icon.$$.fragment);
			t = space();
			input = element("input");
			add_location(span, file$8, 29, 1, 696);
			attr_dev(input, "id", /*id*/ ctx[2]);
			attr_dev(input, "type", /*type*/ ctx[4]);
			input.value = /*value*/ ctx[0];
			attr_dev(input, "placeholder", /*placeholder*/ ctx[3]);
			attr_dev(input, "class", input_class_value = "" + (input_field + " " + /*$themed*/ ctx[5].input_field));
			add_location(input, file$8, 32, 1, 829);
			attr_dev(div, "class", div_class_value = "" + (flex_item + " " + f2 + " " + input_icons + "  mt-2"));
			set_style(div, "min-width", "300px");
			add_location(div, file$8, 28, 0, 620);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, div, anchor);
			append_dev(div, span);
			mount_component(icon, span, null);
			append_dev(div, t);
			append_dev(div, input);
			current = true;
			if (remount) run_all(dispose);

			dispose = [
				listen_dev(span, "click", /*revealToggle*/ ctx[6], false, false, false),
				listen_dev(input, "input", /*handleInput*/ ctx[7], false, false, false)
			];
		},
		p: function update(ctx, [dirty]) {
			const icon_changes = {};
			if (dirty & /*$themed*/ 32) icon_changes.class = "" + (input_icon + " " + /*$themed*/ ctx[5].input_icon);
			if (dirty & /*revealed*/ 2) icon_changes.data = /*revealed*/ ctx[1] ? faEye_2 : faEyeSlash_2;
			icon.$set(icon_changes);

			if (!current || dirty & /*id*/ 4) {
				attr_dev(input, "id", /*id*/ ctx[2]);
			}

			if (!current || dirty & /*type*/ 16) {
				attr_dev(input, "type", /*type*/ ctx[4]);
			}

			if (!current || dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
				prop_dev(input, "value", /*value*/ ctx[0]);
			}

			if (!current || dirty & /*placeholder*/ 8) {
				attr_dev(input, "placeholder", /*placeholder*/ ctx[3]);
			}

			if (!current || dirty & /*$themed*/ 32 && input_class_value !== (input_class_value = "" + (input_field + " " + /*$themed*/ ctx[5].input_field))) {
				attr_dev(input, "class", input_class_value);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(icon);
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$d.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$d($$self, $$props, $$invalidate) {
	let $themed;
	validate_store(themed, "themed");
	component_subscribe($$self, themed, $$value => $$invalidate(5, $themed = $$value));
	let { id } = $$props;
	let { placeholder } = $$props;
	let { type = "text" } = $$props;
	let { value = "" } = $$props;
	let { revealed = false } = $$props;

	const revealToggle = event => {
		const input = event.currentTarget.nextElementSibling;

		if (!input) {
			return;
		}

		input.type = input.type === "password" ? "text" : "password";
		$$invalidate(1, revealed = !revealed);
	};

	const handleInput = event => {
		$$invalidate(0, value = event.target.value);
	};

	const writable_props = ["id", "placeholder", "type", "value", "revealed"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Input", $$slots, []);

	$$self.$set = $$props => {
		if ("id" in $$props) $$invalidate(2, id = $$props.id);
		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
		if ("type" in $$props) $$invalidate(4, type = $$props.type);
		if ("value" in $$props) $$invalidate(0, value = $$props.value);
		if ("revealed" in $$props) $$invalidate(1, revealed = $$props.revealed);
	};

	$$self.$capture_state = () => ({
		themed,
		flex_item,
		f2,
		input_icons,
		input_icon,
		input_field,
		Icon,
		faVisible: faEye_2,
		faHidden: faEyeSlash_2,
		id,
		placeholder,
		type,
		value,
		revealed,
		revealToggle,
		handleInput,
		$themed
	});

	$$self.$inject_state = $$props => {
		if ("id" in $$props) $$invalidate(2, id = $$props.id);
		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
		if ("type" in $$props) $$invalidate(4, type = $$props.type);
		if ("value" in $$props) $$invalidate(0, value = $$props.value);
		if ("revealed" in $$props) $$invalidate(1, revealed = $$props.revealed);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [value, revealed, id, placeholder, type, $themed, revealToggle, handleInput];
}

class Input extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
			id: 2,
			placeholder: 3,
			type: 4,
			value: 0,
			revealed: 1
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Input",
			options,
			id: create_fragment$d.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*id*/ ctx[2] === undefined && !("id" in props)) {
			console.warn("<Input> was created without expected prop 'id'");
		}

		if (/*placeholder*/ ctx[3] === undefined && !("placeholder" in props)) {
			console.warn("<Input> was created without expected prop 'placeholder'");
		}
	}

	get id() {
		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set id(value) {
		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get placeholder() {
		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set placeholder(value) {
		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get type() {
		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set type(value) {
		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get value() {
		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get revealed() {
		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set revealed(value) {
		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/SignIn.svelte generated by Svelte v3.21.0 */

const { Error: Error_1$1 } = globals;
const file$9 = "src/components/SignIn.svelte";

// (100:0) {:else}
function create_else_block$4(ctx) {
	let div;
	let promise;
	let div_intro;
	let current;

	let info = {
		ctx,
		current: null,
		token: null,
		pending: create_pending_block$1,
		then: create_then_block$1,
		catch: create_catch_block$1,
		value: 11,
		error: 12,
		blocks: [,,,]
	};

	handle_promise(promise = /*sent*/ ctx[3], info);

	const block = {
		c: function create() {
			div = element("div");
			info.block.c();
			add_location(div, file$9, 100, 1, 2026);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			info.block.m(div, info.anchor = null);
			info.mount = () => div;
			info.anchor = null;
			current = true;
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			info.ctx = ctx;

			if (dirty & /*sent*/ 8 && promise !== (promise = /*sent*/ ctx[3]) && handle_promise(promise, info)) ; else {
				const child_ctx = ctx.slice();
				child_ctx[11] = info.resolved;
				info.block.p(child_ctx, dirty);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(info.block);

			if (!div_intro) {
				add_render_callback(() => {
					div_intro = create_in_transition(div, fly, { x: -20, duration: 1000 });
					div_intro.start();
				});
			}

			current = true;
		},
		o: function outro(local) {
			for (let i = 0; i < 3; i += 1) {
				const block = info.blocks[i];
				transition_out(block);
			}

			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			info.block.d();
			info.token = null;
			info = null;
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block$4.name,
		type: "else",
		source: "(100:0) {:else}",
		ctx
	});

	return block;
}

// (62:0) {#if sent == null}
function create_if_block$7(ctx) {
	let form;
	let div1;
	let div0;
	let t0;
	let input0;
	let input0_class_value;
	let div0_class_value;
	let t1;
	let updating_value;
	let t2;
	let button_1;
	let t3;
	let button_1_class_value;
	let t4;
	let p;
	let t5;
	let p_class_value;
	let form_intro;
	let current;
	let dispose;

	const icon = new Icon({
			props: {
				class: "" + (input_icon + " " + /*$themed*/ ctx[4].input_icon),
				data: faEnvelope_2
			},
			$$inline: true
		});

	function input1_value_binding(value) {
		/*input1_value_binding*/ ctx[10].call(null, value);
	}

	let input1_props = {
		type: "password",
		id: "password",
		placeholder: "Password.."
	};

	if (/*password*/ ctx[2] !== void 0) {
		input1_props.value = /*password*/ ctx[2];
	}

	const input1 = new Input({ props: input1_props, $$inline: true });
	binding_callbacks.push(() => bind(input1, "value", input1_value_binding));

	const block = {
		c: function create() {
			form = element("form");
			div1 = element("div");
			div0 = element("div");
			create_component(icon.$$.fragment);
			t0 = space();
			input0 = element("input");
			t1 = space();
			create_component(input1.$$.fragment);
			t2 = space();
			button_1 = element("button");
			t3 = text("Sign in");
			t4 = space();
			p = element("p");
			t5 = text("I don't have a password.");
			attr_dev(input0, "class", input0_class_value = "" + (input_field + " " + /*$themed*/ ctx[4].input_field));
			attr_dev(input0, "type", "email");
			attr_dev(input0, "name", "email");
			attr_dev(input0, "placeholder", "Email..");
			add_location(input0, file$9, 73, 4, 1492);
			attr_dev(div0, "class", div0_class_value = "" + (flex_item + "\n\t\t\t\t" + f2 + "\n\t\t\t\t" + input_icons + " mt-2"));
			set_style(div0, "min-width", "300px");
			add_location(div0, file$9, 67, 3, 1325);
			attr_dev(button_1, "class", button_1_class_value = "" + (flex_item + " " + /*$themed*/ ctx[4].button + "\n\t\t\t\t" + f1 + "\n\t\t\t\t" + button + " mt-2"));
			set_style(button_1, "min-width", "300px");
			set_style(button_1, "min-height", "3.5em");
			add_location(button_1, file$9, 87, 3, 1759);
			attr_dev(div1, "class", flex_container);
			add_location(div1, file$9, 66, 2, 1293);
			attr_dev(p, "class", p_class_value = "" + (link + " " + flex_item));
			add_location(p, file$9, 95, 2, 1918);
			add_location(form, file$9, 62, 1, 1203);
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, form, anchor);
			append_dev(form, div1);
			append_dev(div1, div0);
			mount_component(icon, div0, null);
			append_dev(div0, t0);
			append_dev(div0, input0);
			set_input_value(input0, /*email*/ ctx[1]);
			append_dev(div1, t1);
			mount_component(input1, div1, null);
			append_dev(div1, t2);
			append_dev(div1, button_1);
			append_dev(button_1, t3);
			append_dev(form, t4);
			append_dev(form, p);
			append_dev(p, t5);
			current = true;
			if (remount) run_all(dispose);

			dispose = [
				listen_dev(input0, "input", /*input0_input_handler*/ ctx[9]),
				listen_dev(
					p,
					"click",
					function () {
						if (is_function(/*toggleSignUp*/ ctx[0])) /*toggleSignUp*/ ctx[0].apply(this, arguments);
					},
					false,
					false,
					false
				),
				listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[5]), false, true, false)
			];
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			const icon_changes = {};
			if (dirty & /*$themed*/ 16) icon_changes.class = "" + (input_icon + " " + /*$themed*/ ctx[4].input_icon);
			icon.$set(icon_changes);

			if (!current || dirty & /*$themed*/ 16 && input0_class_value !== (input0_class_value = "" + (input_field + " " + /*$themed*/ ctx[4].input_field))) {
				attr_dev(input0, "class", input0_class_value);
			}

			if (dirty & /*email*/ 2 && input0.value !== /*email*/ ctx[1]) {
				set_input_value(input0, /*email*/ ctx[1]);
			}

			const input1_changes = {};

			if (!updating_value && dirty & /*password*/ 4) {
				updating_value = true;
				input1_changes.value = /*password*/ ctx[2];
				add_flush_callback(() => updating_value = false);
			}

			input1.$set(input1_changes);

			if (!current || dirty & /*$themed*/ 16 && button_1_class_value !== (button_1_class_value = "" + (flex_item + " " + /*$themed*/ ctx[4].button + "\n\t\t\t\t" + f1 + "\n\t\t\t\t" + button + " mt-2"))) {
				attr_dev(button_1, "class", button_1_class_value);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			transition_in(input1.$$.fragment, local);

			if (!form_intro) {
				add_render_callback(() => {
					form_intro = create_in_transition(form, fly, { x: -20, duration: 1000 });
					form_intro.start();
				});
			}

			current = true;
		},
		o: function outro(local) {
			transition_out(icon.$$.fragment, local);
			transition_out(input1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(form);
			destroy_component(icon);
			destroy_component(input1);
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$7.name,
		type: "if",
		source: "(62:0) {#if sent == null}",
		ctx
	});

	return block;
}

// (110:2) {:catch error}
function create_catch_block$1(ctx) {
	let div;
	let span;
	let t0;
	let t1;
	let strong;
	let t3;
	let t4_value = /*error*/ ctx[12].message + "";
	let t4;
	let div_class_value;
	let div_intro;
	let dispose;

	const block = {
		c: function create() {
			div = element("div");
			span = element("span");
			t0 = text("×");
			t1 = space();
			strong = element("strong");
			strong.textContent = "Oh no!";
			t3 = text("\n\t\t\t\tSomthing went wrong - ");
			t4 = text(t4_value);
			attr_dev(span, "class", closebtn);
			add_location(span, file$9, 111, 4, 2292);
			add_location(strong, file$9, 112, 4, 2351);
			attr_dev(div, "class", div_class_value = "" + (alert + " " + danger + " "));
			add_location(div, file$9, 110, 3, 2248);
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, div, anchor);
			append_dev(div, span);
			append_dev(span, t0);
			append_dev(div, t1);
			append_dev(div, strong);
			append_dev(div, t3);
			append_dev(div, t4);
			if (remount) dispose();
			dispose = listen_dev(span, "click", /*reset*/ ctx[6], false, false, false);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*sent*/ 8 && t4_value !== (t4_value = /*error*/ ctx[12].message + "")) set_data_dev(t4, t4_value);
		},
		i: function intro(local) {
			if (!div_intro) {
				add_render_callback(() => {
					div_intro = create_in_transition(div, fade, {});
					div_intro.start();
				});
			}
		},
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_catch_block$1.name,
		type: "catch",
		source: "(110:2) {:catch error}",
		ctx
	});

	return block;
}

// (105:2) {:then result}
function create_then_block$1(ctx) {
	let div;
	let strong;
	let t1;
	let div_class_value;
	let div_intro;

	const block = {
		c: function create() {
			div = element("div");
			strong = element("strong");
			strong.textContent = "Thanks!";
			t1 = text("\n\t\t\t\tWe're logging you in now");
			add_location(strong, file$9, 106, 4, 2164);
			attr_dev(div, "class", div_class_value = "" + (alert + " " + success));
			add_location(div, file$9, 105, 3, 2120);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, strong);
			append_dev(div, t1);
		},
		p: noop,
		i: function intro(local) {
			if (!div_intro) {
				add_render_callback(() => {
					div_intro = create_in_transition(div, fade, {});
					div_intro.start();
				});
			}
		},
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_then_block$1.name,
		type: "then",
		source: "(105:2) {:then result}",
		ctx
	});

	return block;
}

// (103:15)     <Spinner />   {:then result}
function create_pending_block$1(ctx) {
	let current;
	const spinner = new Spinner({ $$inline: true });

	const block = {
		c: function create() {
			create_component(spinner.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(spinner, target, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(spinner.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(spinner.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(spinner, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_pending_block$1.name,
		type: "pending",
		source: "(103:15)     <Spinner />   {:then result}",
		ctx
	});

	return block;
}

function create_fragment$e(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$7, create_else_block$4];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*sent*/ ctx[3] == null) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$e.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$e($$self, $$props, $$invalidate) {
	let $themed;
	validate_store(themed, "themed");
	component_subscribe($$self, themed, $$value => $$invalidate(4, $themed = $$value));
	let { auth } = $$props;
	let { toggleSignUp } = $$props;
	let email = "";
	let password = "";
	let sent = null;

	async function doLogin() {
		try {
			await auth.signInWithEmailAndPassword(email, password);
		} catch(err) {
			switch (err.code) {
				case "auth/user-not-found":
				case "auth/wrong-password":
					throw new Error("the email address or password is incorrect.");
				case "auth/user-disabled":
					throw new Error("this account has been disabled.");
				case "auth/invalid-email":
					throw new Error("the email address is not ina a valid format");
				default:
					throw new Error("try again in a few minutes.");
			}
		}
	}

	function handleSubmit(event) {
		$$invalidate(3, sent = doLogin());
	}

	function reset() {
		$$invalidate(3, sent = null);
	}

	const writable_props = ["auth", "toggleSignUp"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SignIn> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("SignIn", $$slots, []);

	function input0_input_handler() {
		email = this.value;
		$$invalidate(1, email);
	}

	function input1_value_binding(value) {
		password = value;
		$$invalidate(2, password);
	}

	$$self.$set = $$props => {
		if ("auth" in $$props) $$invalidate(7, auth = $$props.auth);
		if ("toggleSignUp" in $$props) $$invalidate(0, toggleSignUp = $$props.toggleSignUp);
	};

	$$self.$capture_state = () => ({
		fade,
		fly,
		themed,
		flex_container,
		flex_item,
		f1,
		f2,
		input_icons,
		input_icon,
		input_field,
		button,
		link,
		alert,
		success,
		danger,
		closebtn,
		Icon,
		faEnvelope: faEnvelope_2,
		Input,
		Spinner,
		auth,
		toggleSignUp,
		email,
		password,
		sent,
		doLogin,
		handleSubmit,
		reset,
		$themed
	});

	$$self.$inject_state = $$props => {
		if ("auth" in $$props) $$invalidate(7, auth = $$props.auth);
		if ("toggleSignUp" in $$props) $$invalidate(0, toggleSignUp = $$props.toggleSignUp);
		if ("email" in $$props) $$invalidate(1, email = $$props.email);
		if ("password" in $$props) $$invalidate(2, password = $$props.password);
		if ("sent" in $$props) $$invalidate(3, sent = $$props.sent);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		toggleSignUp,
		email,
		password,
		sent,
		$themed,
		handleSubmit,
		reset,
		auth,
		doLogin,
		input0_input_handler,
		input1_value_binding
	];
}

class SignIn extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$e, create_fragment$e, safe_not_equal, { auth: 7, toggleSignUp: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "SignIn",
			options,
			id: create_fragment$e.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*auth*/ ctx[7] === undefined && !("auth" in props)) {
			console.warn("<SignIn> was created without expected prop 'auth'");
		}

		if (/*toggleSignUp*/ ctx[0] === undefined && !("toggleSignUp" in props)) {
			console.warn("<SignIn> was created without expected prop 'toggleSignUp'");
		}
	}

	get auth() {
		throw new Error_1$1("<SignIn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set auth(value) {
		throw new Error_1$1("<SignIn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get toggleSignUp() {
		throw new Error_1$1("<SignIn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set toggleSignUp(value) {
		throw new Error_1$1("<SignIn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/Joiner.svelte generated by Svelte v3.21.0 */
const file$a = "src/components/Joiner.svelte";

// (17:3) {:else}
function create_else_block$5(ctx) {
	let current;

	const signin = new SignIn({
			props: {
				auth: /*auth*/ ctx[1],
				toggleSignUp: /*toggleSignUp*/ ctx[2]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(signin.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(signin, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const signin_changes = {};
			if (dirty & /*auth*/ 2) signin_changes.auth = /*auth*/ ctx[1];
			signin.$set(signin_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(signin.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(signin.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(signin, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block$5.name,
		type: "else",
		source: "(17:3) {:else}",
		ctx
	});

	return block;
}

// (15:3) {#if signUp}
function create_if_block$8(ctx) {
	let current;

	const signup = new SignUp({
			props: {
				auth: /*auth*/ ctx[1],
				toggleSignUp: /*toggleSignUp*/ ctx[2]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(signup.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(signup, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const signup_changes = {};
			if (dirty & /*auth*/ 2) signup_changes.auth = /*auth*/ ctx[1];
			signup.$set(signup_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(signup.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(signup.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(signup, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$8.name,
		type: "if",
		source: "(15:3) {#if signUp}",
		ctx
	});

	return block;
}

function create_fragment$f(ctx) {
	let div2;
	let div1;
	let div0;
	let current_block_type_index;
	let if_block;
	let current;
	const if_block_creators = [create_if_block$8, create_else_block$5];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*signUp*/ ctx[0]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			div2 = element("div");
			div1 = element("div");
			div0 = element("div");
			if_block.c();
			add_location(div0, file$a, 13, 2, 209);
			add_location(div1, file$a, 12, 1, 201);
			add_location(div2, file$a, 11, 0, 194);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div2, anchor);
			append_dev(div2, div1);
			append_dev(div1, div0);
			if_blocks[current_block_type_index].m(div0, null);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(div0, null);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div2);
			if_blocks[current_block_type_index].d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$f.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$f($$self, $$props, $$invalidate) {
	let { signUp = true } = $$props;
	let { auth } = $$props;

	function toggleSignUp() {
		$$invalidate(0, signUp = !signUp);
	}

	const writable_props = ["signUp", "auth"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Joiner> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Joiner", $$slots, []);

	$$self.$set = $$props => {
		if ("signUp" in $$props) $$invalidate(0, signUp = $$props.signUp);
		if ("auth" in $$props) $$invalidate(1, auth = $$props.auth);
	};

	$$self.$capture_state = () => ({
		SignUp,
		SignIn,
		signUp,
		auth,
		toggleSignUp
	});

	$$self.$inject_state = $$props => {
		if ("signUp" in $$props) $$invalidate(0, signUp = $$props.signUp);
		if ("auth" in $$props) $$invalidate(1, auth = $$props.auth);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [signUp, auth, toggleSignUp];
}

class Joiner extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$f, create_fragment$f, safe_not_equal, { signUp: 0, auth: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Joiner",
			options,
			id: create_fragment$f.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*auth*/ ctx[1] === undefined && !("auth" in props)) {
			console.warn("<Joiner> was created without expected prop 'auth'");
		}
	}

	get signUp() {
		throw new Error("<Joiner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set signUp(value) {
		throw new Error("<Joiner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get auth() {
		throw new Error("<Joiner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set auth(value) {
		throw new Error("<Joiner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/Suprrise.svelte generated by Svelte v3.21.0 */

const file$b = "src/components/Suprrise.svelte";

function create_fragment$g(ctx) {
	let p;
	let t0;
	let t1;
	let t2;

	const block = {
		c: function create() {
			p = element("p");
			t0 = text("🎉 ");
			t1 = text(/*message*/ ctx[0]);
			t2 = text(" 🍾");
			add_location(p, file$b, 4, 0, 42);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, p, anchor);
			append_dev(p, t0);
			append_dev(p, t1);
			append_dev(p, t2);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*message*/ 1) set_data_dev(t1, /*message*/ ctx[0]);
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(p);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$g.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$g($$self, $$props, $$invalidate) {
	let { message } = $$props;
	const writable_props = ["message"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Suprrise> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Suprrise", $$slots, []);

	$$self.$set = $$props => {
		if ("message" in $$props) $$invalidate(0, message = $$props.message);
	};

	$$self.$capture_state = () => ({ message });

	$$self.$inject_state = $$props => {
		if ("message" in $$props) $$invalidate(0, message = $$props.message);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [message];
}

class Suprrise extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$g, create_fragment$g, safe_not_equal, { message: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Suprrise",
			options,
			id: create_fragment$g.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*message*/ ctx[0] === undefined && !("message" in props)) {
			console.warn("<Suprrise> was created without expected prop 'message'");
		}
	}

	get message() {
		throw new Error("<Suprrise>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set message(value) {
		throw new Error("<Suprrise>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

function watchMedia(t){return writable({},e=>{if("undefined"==typeof window)return;let n={},r=()=>e(function(e){let t={classNames:""},n=[];for(let r in e)t[r]=e[r].matches,t[r]&&n.push(`media-${r}`);return t.classNames=n.join(" "),t}(n));for(let e in t){let i=window.matchMedia(t[e]);n[e]=i,n[e].addListener(r);}return r(),()=>{for(let e in n)n[e].removeListener(r);}})}

const mediaQueries = {
    small: "(max-width: 767px)",
    large: "(min-width: 768px)",
};

const media = watchMedia(mediaQueries);

const responsive = derived(
    media,
    $media => createResponsiveHelper($media)
);

let seed = readable(Math.floor(Math.random() * 10));

function createResponsiveHelper(media) {

    return {
        text: (sm, lg) => media.small ? sm : `${lg || sm}`,

    };
}

/* src/components/Tile.svelte generated by Svelte v3.21.0 */
const file$c = "src/components/Tile.svelte";

// (164:2) {#if icon}
function create_if_block_1$4(ctx) {
	let current;

	const icon_1 = new Icon({
			props: {
				scale: /*$responsive*/ ctx[5].scale,
				data: /*icon*/ ctx[2]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(icon_1.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(icon_1, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const icon_1_changes = {};
			if (dirty[0] & /*$responsive*/ 32) icon_1_changes.scale = /*$responsive*/ ctx[5].scale;
			if (dirty[0] & /*icon*/ 4) icon_1_changes.data = /*icon*/ ctx[2];
			icon_1.$set(icon_1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(icon_1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(icon_1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(icon_1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$4.name,
		type: "if",
		source: "(164:2) {#if icon}",
		ctx
	});

	return block;
}

// (172:9)      
function fallback_block$1(ctx) {
	let span;
	let t0;
	let t1;

	const block = {
		c: function create() {
			span = element("span");
			t0 = text("Tile: ");
			t1 = text(/*ordinal*/ ctx[0]);
			add_location(span, file$c, 172, 4, 3408);
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
			append_dev(span, t0);
			append_dev(span, t1);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*ordinal*/ 1) set_data_dev(t1, /*ordinal*/ ctx[0]);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(span);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: fallback_block$1.name,
		type: "fallback",
		source: "(172:9)      ",
		ctx
	});

	return block;
}

// (178:1) {#if help}
function create_if_block$9(ctx) {
	let div;
	let span;
	let t;
	let span_class_value;
	let div_class_value;

	const block = {
		c: function create() {
			div = element("div");
			span = element("span");
			t = text(/*help*/ ctx[1]);
			attr_dev(span, "class", span_class_value = "" + (/*helpCss*/ ctx[15] + "\n\t\t\t\t" + /*$responsive*/ ctx[5].helpCss + "\n\t\t\t\t" + (/*hovering*/ ctx[3] ? visible : /*hidden*/ ctx[19])));
			add_location(span, file$c, 179, 3, 3542);
			attr_dev(div, "class", div_class_value = "" + (/*overlayContainer*/ ctx[12] + " " + (/*hovering*/ ctx[3] ? /*overlay*/ ctx[18] : "")));
			add_location(div, file$c, 178, 2, 3480);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, span);
			append_dev(span, t);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*help*/ 2) set_data_dev(t, /*help*/ ctx[1]);

			if (dirty[0] & /*$responsive, hovering*/ 40 && span_class_value !== (span_class_value = "" + (/*helpCss*/ ctx[15] + "\n\t\t\t\t" + /*$responsive*/ ctx[5].helpCss + "\n\t\t\t\t" + (/*hovering*/ ctx[3] ? visible : /*hidden*/ ctx[19])))) {
				attr_dev(span, "class", span_class_value);
			}

			if (dirty[0] & /*hovering*/ 8 && div_class_value !== (div_class_value = "" + (/*overlayContainer*/ ctx[12] + " " + (/*hovering*/ ctx[3] ? /*overlay*/ ctx[18] : "")))) {
				attr_dev(div, "class", div_class_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$9.name,
		type: "if",
		source: "(178:1) {#if help}",
		ctx
	});

	return block;
}

function create_fragment$h(ctx) {
	let div3;
	let div0;
	let div0_class_value;
	let t0;
	let div2;
	let div1;
	let div1_class_value;
	let t1;
	let div3_intro;
	let current;
	let dispose;
	let if_block0 = /*icon*/ ctx[2] && create_if_block_1$4(ctx);
	const default_slot_template = /*$$slots*/ ctx[31].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[30], null);
	const default_slot_or_fallback = default_slot || fallback_block$1(ctx);
	let if_block1 = /*help*/ ctx[1] && create_if_block$9(ctx);

	const block = {
		c: function create() {
			div3 = element("div");
			div0 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			div2 = element("div");
			div1 = element("div");
			if (default_slot_or_fallback) default_slot_or_fallback.c();
			t1 = space();
			if (if_block1) if_block1.c();

			attr_dev(div0, "class", div0_class_value = "" + (/*iconContainer*/ ctx[11] + " " + (/*hovering*/ ctx[3]
			? /*active*/ ctx[16]
			: /*inactive*/ ctx[17])));

			add_location(div0, file$c, 162, 1, 3164);
			attr_dev(div1, "class", div1_class_value = "" + (/*contentItem*/ ctx[14] + " " + /*$responsive*/ ctx[5].contentItem));
			add_location(div1, file$c, 170, 2, 3340);
			attr_dev(div2, "class", /*contentContainer*/ ctx[13]);
			add_location(div2, file$c, 169, 1, 3307);
			attr_dev(div3, "class", /*classes*/ ctx[4]);
			add_location(div3, file$c, 154, 0, 2987);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, div3, anchor);
			append_dev(div3, div0);
			if (if_block0) if_block0.m(div0, null);
			append_dev(div3, t0);
			append_dev(div3, div2);
			append_dev(div2, div1);

			if (default_slot_or_fallback) {
				default_slot_or_fallback.m(div1, null);
			}

			append_dev(div3, t1);
			if (if_block1) if_block1.m(div3, null);
			current = true;
			if (remount) run_all(dispose);

			dispose = [
				listen_dev(div3, "mouseenter", /*enter*/ ctx[7], false, false, false),
				listen_dev(div3, "mouseleave", /*leave*/ ctx[8], false, false, false),
				listen_dev(div3, "click", /*handleClick*/ ctx[9], false, false, false),
				listen_dev(div3, "tap", /*handleTap*/ ctx[10], false, false, false)
			];
		},
		p: function update(ctx, dirty) {
			if (/*icon*/ ctx[2]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty[0] & /*icon*/ 4) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_1$4(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(div0, null);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (!current || dirty[0] & /*hovering*/ 8 && div0_class_value !== (div0_class_value = "" + (/*iconContainer*/ ctx[11] + " " + (/*hovering*/ ctx[3]
			? /*active*/ ctx[16]
			: /*inactive*/ ctx[17])))) {
				attr_dev(div0, "class", div0_class_value);
			}

			if (default_slot) {
				if (default_slot.p && dirty[0] & /*$$scope*/ 1073741824) {
					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[30], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[30], dirty, null));
				}
			} else {
				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty[0] & /*ordinal*/ 1) {
					default_slot_or_fallback.p(ctx, dirty);
				}
			}

			if (!current || dirty[0] & /*$responsive*/ 32 && div1_class_value !== (div1_class_value = "" + (/*contentItem*/ ctx[14] + " " + /*$responsive*/ ctx[5].contentItem))) {
				attr_dev(div1, "class", div1_class_value);
			}

			if (/*help*/ ctx[1]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block$9(ctx);
					if_block1.c();
					if_block1.m(div3, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (!current || dirty[0] & /*classes*/ 16) {
				attr_dev(div3, "class", /*classes*/ ctx[4]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(default_slot_or_fallback, local);

			if (!div3_intro) {
				add_render_callback(() => {
					div3_intro = create_in_transition(div3, fly, {
						x: -20 * /*ordinal*/ ctx[0],
						duration: 500 + 100 * /*ordinal*/ ctx[0]
					});

					div3_intro.start();
				});
			}

			current = true;
		},
		o: function outro(local) {
			transition_out(if_block0);
			transition_out(default_slot_or_fallback, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div3);
			if (if_block0) if_block0.d();
			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
			if (if_block1) if_block1.d();
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$h.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

const visible = "";

function instance$h($$self, $$props, $$invalidate) {
	let $seed;
	let $theme;
	let $responsive;
	validate_store(seed, "seed");
	component_subscribe($$self, seed, $$value => $$invalidate(23, $seed = $$value));
	validate_store(theme, "theme");
	component_subscribe($$self, theme, $$value => $$invalidate(24, $theme = $$value));

	const responsive = derived(media, $media => {
		return {
			tileContainer: css`
				min-height: ${$media.small ? "40px" : "80px"};
			`,
			contentItem: css`
				margin: ${$media.small ? "0.2em" : "0.5em"};
				min-width: ${$media.small ? "40px" : "80px"};
				font-size: ${$media.small ? "0.8em" : "1.5em"};
			`,
			helpCss: css`
				font-size: ${$media.small ? "0.6em" : "1.1em"};
			`,
			scale: $media.small ? 2 : 3
		};
	});

	validate_store(responsive, "responsive");
	component_subscribe($$self, responsive, value => $$invalidate(5, $responsive = value));
	const dispatch = createEventDispatcher();
	let { ordinal = 0 } = $$props;
	let idx = (ordinal + $seed) % 9;
	let hovering = false;
	let { bgcolor = $theme.palate("theme")[idx] } = $$props;
	let { iconcolor = darken(bgcolor) } = $$props;
	let { color = blackOrWhite(bgcolor) } = $$props;
	let { help = null } = $$props;
	let { icon = null } = $$props;

	function enter(event) {
		$$invalidate(3, hovering = true);
	}

	function leave(event) {
		$$invalidate(3, hovering = false);
	}

	function handleClick(event) {
		dispatch("click", {
			ordinal,
			text: "Click! from tile " + ordinal
		});
	}

	function handleTap(event) {
		dispatch("click", { text: "Tap! from tile " + ordinal });
	}

	const tileContainer = css`
		position: relative;
		margin: 0;
		padding: 0;
		color: ${color};
	`;

	const iconContainer = css`
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		margin: auto;
		z-index: -1;
		color: ${iconcolor};
		overflow: hidden;
	`;

	const overlayContainer = css`
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-flow: column wrap;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		z-index: 1;
		overflow: hidden;
	`;

	const contentContainer = css`
		position: relative;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;

		display: flex;
		flex-flow: column wrap;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		color: ${color};
	`;

	const contentItem = css`
		position: relative;
	`;

	const helpCss = css`
		margin-top: auto;
		padding: auto;
		color: ${color};
	`;

	const ease = css`
		transition: all 0.5s ease;
	`;

	const active = css`
		background-color: ${iconcolor};
		color: ${bgcolor};
		${ease}
	`;

	const inactive = css`
		background-color: ${bgcolor};
		color: ${iconcolor};
		${ease}
	`;

	const overlay = css`
		background-color: rgba(2, 2, 2, 0.2);
		${ease}
	`;

	const hidden = css`
		visibility: hidden;
	`;

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Tile", $$slots, ['default']);

	$$self.$set = $$new_props => {
		$$invalidate(29, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ("ordinal" in $$new_props) $$invalidate(0, ordinal = $$new_props.ordinal);
		if ("bgcolor" in $$new_props) $$invalidate(20, bgcolor = $$new_props.bgcolor);
		if ("iconcolor" in $$new_props) $$invalidate(21, iconcolor = $$new_props.iconcolor);
		if ("color" in $$new_props) $$invalidate(22, color = $$new_props.color);
		if ("help" in $$new_props) $$invalidate(1, help = $$new_props.help);
		if ("icon" in $$new_props) $$invalidate(2, icon = $$new_props.icon);
		if ("$$scope" in $$new_props) $$invalidate(30, $$scope = $$new_props.$$scope);
	};

	$$self.$capture_state = () => ({
		derived,
		theme,
		seed,
		Icon,
		css,
		blackOrWhite,
		brighten,
		darken,
		fly,
		createEventDispatcher,
		media,
		responsive,
		dispatch,
		ordinal,
		idx,
		hovering,
		bgcolor,
		iconcolor,
		color,
		help,
		icon,
		enter,
		leave,
		handleClick,
		handleTap,
		tileContainer,
		iconContainer,
		overlayContainer,
		contentContainer,
		contentItem,
		helpCss,
		ease,
		active,
		inactive,
		overlay,
		visible,
		hidden,
		$seed,
		$theme,
		classes,
		$responsive
	});

	$$self.$inject_state = $$new_props => {
		$$invalidate(29, $$props = assign(assign({}, $$props), $$new_props));
		if ("ordinal" in $$props) $$invalidate(0, ordinal = $$new_props.ordinal);
		if ("idx" in $$props) idx = $$new_props.idx;
		if ("hovering" in $$props) $$invalidate(3, hovering = $$new_props.hovering);
		if ("bgcolor" in $$props) $$invalidate(20, bgcolor = $$new_props.bgcolor);
		if ("iconcolor" in $$props) $$invalidate(21, iconcolor = $$new_props.iconcolor);
		if ("color" in $$props) $$invalidate(22, color = $$new_props.color);
		if ("help" in $$props) $$invalidate(1, help = $$new_props.help);
		if ("icon" in $$props) $$invalidate(2, icon = $$new_props.icon);
		if ("classes" in $$props) $$invalidate(4, classes = $$new_props.classes);
	};

	let classes;

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		 $$invalidate(4, classes = `${tileContainer} ${$responsive.tileContainer}` + ($$props.class ? " " + $$props.class : ""));
	};

	$$props = exclude_internal_props($$props);

	return [
		ordinal,
		help,
		icon,
		hovering,
		classes,
		$responsive,
		responsive,
		enter,
		leave,
		handleClick,
		handleTap,
		iconContainer,
		overlayContainer,
		contentContainer,
		contentItem,
		helpCss,
		active,
		inactive,
		overlay,
		hidden,
		bgcolor,
		iconcolor,
		color,
		$seed,
		$theme,
		dispatch,
		idx,
		tileContainer,
		ease,
		$$props,
		$$scope,
		$$slots
	];
}

class Tile extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(
			this,
			options,
			instance$h,
			create_fragment$h,
			safe_not_equal,
			{
				ordinal: 0,
				bgcolor: 20,
				iconcolor: 21,
				color: 22,
				help: 1,
				icon: 2
			},
			[-1, -1]
		);

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Tile",
			options,
			id: create_fragment$h.name
		});
	}

	get ordinal() {
		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set ordinal(value) {
		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get bgcolor() {
		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set bgcolor(value) {
		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get iconcolor() {
		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set iconcolor(value) {
		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get help() {
		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set help(value) {
		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get icon() {
		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set icon(value) {
		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/TilePannel.svelte generated by Svelte v3.21.0 */
const file$d = "src/components/TilePannel.svelte";

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[1] = list[i].help;
	child_ctx[2] = list[i].icon;
	child_ctx[3] = list[i].handler;
	child_ctx[4] = list[i].value;
	child_ctx[5] = list[i].flex;
	child_ctx[7] = i;
	return child_ctx;
}

// (12:2) <Tile ordinal={i + 1} {icon} {help} class={flex || f1} on:click={handler}>
function create_default_slot$1(ctx) {
	let center;
	let raw_value = (/*value*/ ctx[4] || "") + "";
	let t;

	const block = {
		c: function create() {
			center = element("center");
			t = space();
			add_location(center, file$d, 12, 3, 298);
		},
		m: function mount(target, anchor) {
			insert_dev(target, center, anchor);
			center.innerHTML = raw_value;
			insert_dev(target, t, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*tiles*/ 1 && raw_value !== (raw_value = (/*value*/ ctx[4] || "") + "")) center.innerHTML = raw_value;		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(center);
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$1.name,
		type: "slot",
		source: "(12:2) <Tile ordinal={i + 1} {icon} {help} class={flex || f1} on:click={handler}>",
		ctx
	});

	return block;
}

// (11:1) {#each tiles as { help, icon, handler, value, flex}
function create_each_block$1(ctx) {
	let current;

	const tile = new Tile({
			props: {
				ordinal: /*i*/ ctx[7] + 1,
				icon: /*icon*/ ctx[2],
				help: /*help*/ ctx[1],
				class: /*flex*/ ctx[5] || f1,
				$$slots: { default: [create_default_slot$1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	tile.$on("click", function () {
		if (is_function(/*handler*/ ctx[3])) /*handler*/ ctx[3].apply(this, arguments);
	});

	const block = {
		c: function create() {
			create_component(tile.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(tile, target, anchor);
			current = true;
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			const tile_changes = {};
			if (dirty & /*tiles*/ 1) tile_changes.icon = /*icon*/ ctx[2];
			if (dirty & /*tiles*/ 1) tile_changes.help = /*help*/ ctx[1];
			if (dirty & /*tiles*/ 1) tile_changes.class = /*flex*/ ctx[5] || f1;

			if (dirty & /*$$scope, tiles*/ 257) {
				tile_changes.$$scope = { dirty, ctx };
			}

			tile.$set(tile_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(tile.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(tile.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(tile, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$1.name,
		type: "each",
		source: "(11:1) {#each tiles as { help, icon, handler, value, flex}",
		ctx
	});

	return block;
}

function create_fragment$i(ctx) {
	let div;
	let current;
	let each_value = /*tiles*/ ctx[0];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	const block = {
		c: function create() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr_dev(div, "class", flex_container);
			add_location(div, file$d, 8, 0, 131);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*tiles, f1*/ 1) {
				each_value = /*tiles*/ ctx[0];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o: function outro(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_each(each_blocks, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$i.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$i($$self, $$props, $$invalidate) {
	let { tiles = [] } = $$props;
	const writable_props = ["tiles"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TilePannel> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("TilePannel", $$slots, []);

	$$self.$set = $$props => {
		if ("tiles" in $$props) $$invalidate(0, tiles = $$props.tiles);
	};

	$$self.$capture_state = () => ({ flex_container, f1, Tile, tiles });

	$$self.$inject_state = $$props => {
		if ("tiles" in $$props) $$invalidate(0, tiles = $$props.tiles);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [tiles];
}

class TilePannel extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$i, create_fragment$i, safe_not_equal, { tiles: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "TilePannel",
			options,
			id: create_fragment$i.name
		});
	}

	get tiles() {
		throw new Error("<TilePannel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set tiles(value) {
		throw new Error("<TilePannel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

function buyMeACoffee() {
    return {
    help: 'Donate',
    icon: faHandHoldingUsd_2,
    handler: () => window.open('https://www.buymeacoffee.com/thekitchencoder'),
    value: ''
};}

function signOut(auth){
    return {
        help: 'Sign Out',
        icon: faSignOutAlt_2,
        handler: () => auth.signOut(),
        value: '',
    }
}

/* src/components/DashStrip.svelte generated by Svelte v3.21.0 */

const { console: console_1$2 } = globals;

function create_fragment$j(ctx) {
	let current;

	const tilepannel = new TilePannel({
			props: {
				tiles: /*createTiles*/ ctx[1](/*profile*/ ctx[0])
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(tilepannel.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(tilepannel, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const tilepannel_changes = {};
			if (dirty & /*profile*/ 1) tilepannel_changes.tiles = /*createTiles*/ ctx[1](/*profile*/ ctx[0]);
			tilepannel.$set(tilepannel_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(tilepannel.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(tilepannel.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(tilepannel, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$j.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$j($$self, $$props, $$invalidate) {
	let { profile } = $$props;
	let { auth } = $$props;
	let user;
	console.log(profile.likes);
	const { open } = getContext("simple-modal");

	function handleClick(event) {
		open(Suprrise, { message: event.detail.text });
	}

	function createTiles(profile) {
		return [
			{
				icon: faUserAlt_2,
				handler: handleClick,
				flex: `${nowrap} ${f4}`,
				value: `<h5><strong>${profile.username}</strong></h5>`
			},
			// { help: 'Thumb', icon: faThumb, handler: handleClick },
			{
				help: "Likes",
				icon: faHeart_2,
				handler: handleClick,
				// value: `<i class="fas fa-arrow-right"></i>34<br/><i class="fas fa-arrow-left"></i>21`,
				value: profile.likes
			},
			{
				help: "Places",
				icon: faMapMarkerAlt_2,
				handler: handleClick,
				value: profile.places
			},
			{
				help: "Share",
				icon: faShareAlt_2,
				handler: handleClick,
				value: profile.shares
			},
			{
				help: "Maps",
				icon: faMapMarkedAlt_2,
				handler: handleClick,
				value: ""
			},
			{
				help: "Link",
				icon: faLink_2,
				handler: handleClick,
				value: ""
			},
			buyMeACoffee(),
			signOut(auth)
		];
	}

	const writable_props = ["profile", "auth"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<DashStrip> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("DashStrip", $$slots, []);

	$$self.$set = $$props => {
		if ("profile" in $$props) $$invalidate(0, profile = $$props.profile);
		if ("auth" in $$props) $$invalidate(2, auth = $$props.auth);
	};

	$$self.$capture_state = () => ({
		faUser: faUserAlt_2,
		faMarker: faMapMarkerAlt_2,
		faThumb: faThumbsUp_2,
		faHeart: faHeart_2,
		faLink: faLink_2,
		faShare: faShareAlt_2,
		faDonate: faHandHoldingUsd_2,
		faMap: faMapMarkedAlt_2,
		getContext,
		Suprise: Suprrise,
		f4,
		nowrap,
		TilePannel,
		buyMeACoffee,
		signOut,
		profile,
		auth,
		user,
		open,
		handleClick,
		createTiles
	});

	$$self.$inject_state = $$props => {
		if ("profile" in $$props) $$invalidate(0, profile = $$props.profile);
		if ("auth" in $$props) $$invalidate(2, auth = $$props.auth);
		if ("user" in $$props) user = $$props.user;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [profile, createTiles, auth];
}

class DashStrip extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$j, create_fragment$j, safe_not_equal, { profile: 0, auth: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "DashStrip",
			options,
			id: create_fragment$j.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*profile*/ ctx[0] === undefined && !("profile" in props)) {
			console_1$2.warn("<DashStrip> was created without expected prop 'profile'");
		}

		if (/*auth*/ ctx[2] === undefined && !("auth" in props)) {
			console_1$2.warn("<DashStrip> was created without expected prop 'auth'");
		}
	}

	get profile() {
		throw new Error("<DashStrip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set profile(value) {
		throw new Error("<DashStrip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get auth() {
		throw new Error("<DashStrip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set auth(value) {
		throw new Error("<DashStrip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/ProfileIncomplete.svelte generated by Svelte v3.21.0 */

function create_fragment$k(ctx) {
	let current;

	const tilepannel = new TilePannel({
			props: { tiles: /*tiles*/ ctx[0] },
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(tilepannel.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(tilepannel, target, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(tilepannel.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(tilepannel.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(tilepannel, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$k.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$k($$self, $$props, $$invalidate) {
	let $responsive;
	validate_store(responsive, "responsive");
	component_subscribe($$self, responsive, $$value => $$invalidate(4, $responsive = $$value));
	const { open } = getContext("simple-modal");
	let { user } = $$props;
	let { auth } = $$props;
	let { profileRef } = $$props;

	function clickHandler(event) {
		open(Suprrise, { message: event.detail.text });
	}

	let tiles = [
		{
			help: $responsive.text("Finish Profile", "Do it Now!"),
			icon: faUserAltSlash_2,
			handler: () => profileRef.set({ uid: user.uid, title: "My Profile" }),
			flex: f4,
			value: $responsive.text("Please complete your profile.", "<h5>Please complete your profile it won't take long</h5>")
		},
		buyMeACoffee(),
		signOut(auth)
	];

	const writable_props = ["user", "auth", "profileRef"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProfileIncomplete> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("ProfileIncomplete", $$slots, []);

	$$self.$set = $$props => {
		if ("user" in $$props) $$invalidate(1, user = $$props.user);
		if ("auth" in $$props) $$invalidate(2, auth = $$props.auth);
		if ("profileRef" in $$props) $$invalidate(3, profileRef = $$props.profileRef);
	};

	$$self.$capture_state = () => ({
		signOut,
		buyMeACoffee,
		f4,
		faNoProfile: faUserAltSlash_2,
		TilePannel,
		responsive,
		getContext,
		Suprise: Suprrise,
		open,
		user,
		auth,
		profileRef,
		clickHandler,
		tiles,
		$responsive
	});

	$$self.$inject_state = $$props => {
		if ("user" in $$props) $$invalidate(1, user = $$props.user);
		if ("auth" in $$props) $$invalidate(2, auth = $$props.auth);
		if ("profileRef" in $$props) $$invalidate(3, profileRef = $$props.profileRef);
		if ("tiles" in $$props) $$invalidate(0, tiles = $$props.tiles);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [tiles, user, auth, profileRef];
}

class ProfileIncomplete extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$k, create_fragment$k, safe_not_equal, { user: 1, auth: 2, profileRef: 3 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "ProfileIncomplete",
			options,
			id: create_fragment$k.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*user*/ ctx[1] === undefined && !("user" in props)) {
			console.warn("<ProfileIncomplete> was created without expected prop 'user'");
		}

		if (/*auth*/ ctx[2] === undefined && !("auth" in props)) {
			console.warn("<ProfileIncomplete> was created without expected prop 'auth'");
		}

		if (/*profileRef*/ ctx[3] === undefined && !("profileRef" in props)) {
			console.warn("<ProfileIncomplete> was created without expected prop 'profileRef'");
		}
	}

	get user() {
		throw new Error("<ProfileIncomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set user(value) {
		throw new Error("<ProfileIncomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get auth() {
		throw new Error("<ProfileIncomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set auth(value) {
		throw new Error("<ProfileIncomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get profileRef() {
		throw new Error("<ProfileIncomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set profileRef(value) {
		throw new Error("<ProfileIncomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/UserInfo.svelte generated by Svelte v3.21.0 */
const file$e = "src/components/UserInfo.svelte";

// (23:1) <div slot="fallback">
function create_fallback_slot(ctx) {
	let div;
	let current;

	const profileincomplete = new ProfileIncomplete({
			props: {
				auth: /*auth*/ ctx[1],
				user: /*user*/ ctx[0],
				profileRef: /*profileRef*/ ctx[3]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			div = element("div");
			create_component(profileincomplete.$$.fragment);
			attr_dev(div, "slot", "fallback");
			add_location(div, file$e, 22, 1, 446);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(profileincomplete, div, null);
			current = true;
		},
		p: function update(ctx, dirty) {
			const profileincomplete_changes = {};
			if (dirty & /*auth*/ 2) profileincomplete_changes.auth = /*auth*/ ctx[1];
			if (dirty & /*user*/ 1) profileincomplete_changes.user = /*user*/ ctx[0];
			if (dirty & /*profileRef*/ 8) profileincomplete_changes.profileRef = /*profileRef*/ ctx[3];
			profileincomplete.$set(profileincomplete_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(profileincomplete.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(profileincomplete.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(profileincomplete);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fallback_slot.name,
		type: "slot",
		source: "(23:1) <div slot=\\\"fallback\\\">",
		ctx
	});

	return block;
}

// (28:1) <span slot="loading">
function create_loading_slot(ctx) {
	let span;
	let current;
	const spinner = new Spinner({ $$inline: true });

	const block = {
		c: function create() {
			span = element("span");
			create_component(spinner.$$.fragment);
			attr_dev(span, "slot", "loading");
			add_location(span, file$e, 27, 1, 584);
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
			mount_component(spinner, span, null);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(spinner.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(spinner.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(span);
			destroy_component(spinner);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_loading_slot.name,
		type: "slot",
		source: "(28:1) <span slot=\\\"loading\\\">",
		ctx
	});

	return block;
}

// (15:0) <Doc  path={`queue/${user.uid}`}  let:data={profile}  let:ref={profileRef}  log>
function create_default_slot$2(ctx) {
	let t0;
	let t1;
	let current;

	const dashstrip = new DashStrip({
			props: {
				auth: /*auth*/ ctx[1],
				user: /*user*/ ctx[0],
				profile: /*profile*/ ctx[2]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(dashstrip.$$.fragment);
			t0 = space();
			t1 = space();
		},
		m: function mount(target, anchor) {
			mount_component(dashstrip, target, anchor);
			insert_dev(target, t0, anchor);
			insert_dev(target, t1, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const dashstrip_changes = {};
			if (dirty & /*auth*/ 2) dashstrip_changes.auth = /*auth*/ ctx[1];
			if (dirty & /*user*/ 1) dashstrip_changes.user = /*user*/ ctx[0];
			if (dirty & /*profile*/ 4) dashstrip_changes.profile = /*profile*/ ctx[2];
			dashstrip.$set(dashstrip_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(dashstrip.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(dashstrip.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(dashstrip, detaching);
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(t1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$2.name,
		type: "slot",
		source: "(15:0) <Doc  path={`queue/${user.uid}`}  let:data={profile}  let:ref={profileRef}  log>",
		ctx
	});

	return block;
}

function create_fragment$l(ctx) {
	let current;

	const doc = new Doc({
			props: {
				path: `queue/${/*user*/ ctx[0].uid}`,
				log: true,
				$$slots: {
					default: [
						create_default_slot$2,
						({ data: profile, ref: profileRef }) => ({ 2: profile, 3: profileRef }),
						({ data: profile, ref: profileRef }) => (profile ? 4 : 0) | (profileRef ? 8 : 0)
					],
					loading: [
						create_loading_slot,
						({ data: profile, ref: profileRef }) => ({ 2: profile, 3: profileRef }),
						({ data: profile, ref: profileRef }) => (profile ? 4 : 0) | (profileRef ? 8 : 0)
					],
					fallback: [
						create_fallback_slot,
						({ data: profile, ref: profileRef }) => ({ 2: profile, 3: profileRef }),
						({ data: profile, ref: profileRef }) => (profile ? 4 : 0) | (profileRef ? 8 : 0)
					]
				},
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(doc.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(doc, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const doc_changes = {};
			if (dirty & /*user*/ 1) doc_changes.path = `queue/${/*user*/ ctx[0].uid}`;

			if (dirty & /*$$scope, auth, user, profileRef, profile*/ 31) {
				doc_changes.$$scope = { dirty, ctx };
			}

			doc.$set(doc_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(doc.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(doc.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(doc, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$l.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$l($$self, $$props, $$invalidate) {
	let { user } = $$props;
	let { auth } = $$props;
	let profile;
	const writable_props = ["user", "auth"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UserInfo> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("UserInfo", $$slots, []);

	$$self.$set = $$props => {
		if ("user" in $$props) $$invalidate(0, user = $$props.user);
		if ("auth" in $$props) $$invalidate(1, auth = $$props.auth);
	};

	$$self.$capture_state = () => ({
		Doc,
		Collection,
		Spinner,
		DashStrip,
		ProfileIncomplete,
		user,
		auth,
		profile
	});

	$$self.$inject_state = $$props => {
		if ("user" in $$props) $$invalidate(0, user = $$props.user);
		if ("auth" in $$props) $$invalidate(1, auth = $$props.auth);
		if ("profile" in $$props) $$invalidate(2, profile = $$props.profile);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [user, auth, profile];
}

class UserInfo extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$l, create_fragment$l, safe_not_equal, { user: 0, auth: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "UserInfo",
			options,
			id: create_fragment$l.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*user*/ ctx[0] === undefined && !("user" in props)) {
			console.warn("<UserInfo> was created without expected prop 'user'");
		}

		if (/*auth*/ ctx[1] === undefined && !("auth" in props)) {
			console.warn("<UserInfo> was created without expected prop 'auth'");
		}
	}

	get user() {
		throw new Error("<UserInfo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set user(value) {
		throw new Error("<UserInfo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get auth() {
		throw new Error("<UserInfo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set auth(value) {
		throw new Error("<UserInfo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

const key = {};

/* src/components/HowBusyRegistration.svelte generated by Svelte v3.21.0 */
const file$f = "src/components/HowBusyRegistration.svelte";

// (19:4) <div slot="signed-out">
function create_signed_out_slot(ctx) {
	let div;
	let current;

	const joiner = new Joiner({
			props: { auth: /*auth*/ ctx[2], signUp: true },
			$$inline: true
		});

	const block = {
		c: function create() {
			div = element("div");
			create_component(joiner.$$.fragment);
			attr_dev(div, "slot", "signed-out");
			add_location(div, file$f, 18, 4, 449);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(joiner, div, null);
			current = true;
		},
		p: function update(ctx, dirty) {
			const joiner_changes = {};
			if (dirty & /*auth*/ 4) joiner_changes.auth = /*auth*/ ctx[2];
			joiner.$set(joiner_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(joiner.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(joiner.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(joiner);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_signed_out_slot.name,
		type: "slot",
		source: "(19:4) <div slot=\\\"signed-out\\\">",
		ctx
	});

	return block;
}

// (18:3) <User let:user let:auth>
function create_default_slot_1(ctx) {
	let t;
	let current;

	const userinfo = new UserInfo({
			props: {
				user: /*user*/ ctx[1],
				auth: /*auth*/ ctx[2]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			t = space();
			create_component(userinfo.$$.fragment);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
			mount_component(userinfo, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const userinfo_changes = {};
			if (dirty & /*user*/ 2) userinfo_changes.user = /*user*/ ctx[1];
			if (dirty & /*auth*/ 4) userinfo_changes.auth = /*auth*/ ctx[2];
			userinfo.$set(userinfo_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(userinfo.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(userinfo.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
			destroy_component(userinfo, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1.name,
		type: "slot",
		source: "(18:3) <User let:user let:auth>",
		ctx
	});

	return block;
}

// (15:2) <FirebaseApp {firebase}>
function create_default_slot$3(ctx) {
	let current;

	const user = new User({
			props: {
				$$slots: {
					default: [
						create_default_slot_1,
						({ user, auth }) => ({ 1: user, 2: auth }),
						({ user, auth }) => (user ? 2 : 0) | (auth ? 4 : 0)
					],
					"signed-out": [
						create_signed_out_slot,
						({ user, auth }) => ({ 1: user, 2: auth }),
						({ user, auth }) => (user ? 2 : 0) | (auth ? 4 : 0)
					]
				},
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(user.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(user, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const user_changes = {};

			if (dirty & /*$$scope, user, auth*/ 14) {
				user_changes.$$scope = { dirty, ctx };
			}

			user.$set(user_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(user.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(user.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(user, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$3.name,
		type: "slot",
		source: "(15:2) <FirebaseApp {firebase}>",
		ctx
	});

	return block;
}

function create_fragment$m(ctx) {
	let div;
	let current;

	const firebaseapp = new FirebaseApp({
			props: {
				firebase: /*firebase*/ ctx[0],
				$$slots: { default: [create_default_slot$3] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			div = element("div");
			create_component(firebaseapp.$$.fragment);
			add_location(div, file$f, 11, 1, 312);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(firebaseapp, div, null);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const firebaseapp_changes = {};

			if (dirty & /*$$scope*/ 8) {
				firebaseapp_changes.$$scope = { dirty, ctx };
			}

			firebaseapp.$set(firebaseapp_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(firebaseapp.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(firebaseapp.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(firebaseapp);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$m.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$m($$self, $$props, $$invalidate) {
	let firebase = getContext(key).getFirebase();
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HowBusyRegistration> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("HowBusyRegistration", $$slots, []);

	$$self.$capture_state = () => ({
		theme,
		FirebaseApp,
		User,
		Joiner,
		UserInfo,
		getContext,
		key,
		firebase
	});

	$$self.$inject_state = $$props => {
		if ("firebase" in $$props) $$invalidate(0, firebase = $$props.firebase);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [firebase];
}

class HowBusyRegistration extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "HowBusyRegistration",
			options,
			id: create_fragment$m.name
		});
	}
}

/* src/Main.svelte generated by Svelte v3.21.0 */

// (19:0) <Modal>
function create_default_slot$4(ctx) {
	let current;
	const howbusyregistration = new HowBusyRegistration({ $$inline: true });

	const block = {
		c: function create() {
			create_component(howbusyregistration.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(howbusyregistration, target, anchor);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(howbusyregistration.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(howbusyregistration.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(howbusyregistration, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$4.name,
		type: "slot",
		source: "(19:0) <Modal>",
		ctx
	});

	return block;
}

function create_fragment$n(ctx) {
	let current;

	const modal = new Modal({
			props: {
				$$slots: { default: [create_default_slot$4] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(modal.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(modal, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const modal_changes = {};

			if (dirty & /*$$scope*/ 4) {
				modal_changes.$$scope = { dirty, ctx };
			}

			modal.$set(modal_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(modal.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(modal.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(modal, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$n.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$n($$self, $$props, $$invalidate) {
	let { firebase } = $$props;
	let { colors = {} } = $$props;
	theme.color(colors);
	setContext(key, { getFirebase: () => firebase });
	const writable_props = ["firebase", "colors"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Main> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Main", $$slots, []);

	$$self.$set = $$props => {
		if ("firebase" in $$props) $$invalidate(0, firebase = $$props.firebase);
		if ("colors" in $$props) $$invalidate(1, colors = $$props.colors);
	};

	$$self.$capture_state = () => ({
		Modal,
		setContext,
		theme,
		HowBusyRegistration,
		key,
		firebase,
		colors
	});

	$$self.$inject_state = $$props => {
		if ("firebase" in $$props) $$invalidate(0, firebase = $$props.firebase);
		if ("colors" in $$props) $$invalidate(1, colors = $$props.colors);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [firebase, colors];
}

class Main extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$n, create_fragment$n, safe_not_equal, { firebase: 0, colors: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Main",
			options,
			id: create_fragment$n.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*firebase*/ ctx[0] === undefined && !("firebase" in props)) {
			console.warn("<Main> was created without expected prop 'firebase'");
		}
	}

	get firebase() {
		throw new Error("<Main>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set firebase(value) {
		throw new Error("<Main>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get colors() {
		throw new Error("<Main>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set colors(value) {
		throw new Error("<Main>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

export default Main;
//# sourceMappingURL=bundle.mjs.map
