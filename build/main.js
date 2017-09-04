
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _justgage$tachyons_elm$Tachyons$stylesheet = function (url) {
	return A3(
		_elm_lang$html$Html$node,
		'link',
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$rel('stylesheet'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$href(url),
				_1: {ctor: '[]'}
			}
		},
		{ctor: '[]'});
};
var _justgage$tachyons_elm$Tachyons$tachyons = {
	css: _justgage$tachyons_elm$Tachyons$stylesheet('https://unpkg.com/tachyons@4.6.1/css/tachyons.min.css')
};
var _justgage$tachyons_elm$Tachyons$classes = function (stringList) {
	return _elm_lang$html$Html_Attributes$class(
		A2(_elm_lang$core$String$join, ' ', stringList));
};

var _justgage$tachyons_elm$Tachyons_Classes$z_unset = 'z-unset';
var _justgage$tachyons_elm$Tachyons_Classes$z_max = 'z-max';
var _justgage$tachyons_elm$Tachyons_Classes$z_initial = 'z-initial';
var _justgage$tachyons_elm$Tachyons_Classes$z_inherit = 'z-inherit';
var _justgage$tachyons_elm$Tachyons_Classes$z_9999 = 'z-9999';
var _justgage$tachyons_elm$Tachyons_Classes$z_999 = 'z-999';
var _justgage$tachyons_elm$Tachyons_Classes$z_5 = 'z-5';
var _justgage$tachyons_elm$Tachyons_Classes$z_4 = 'z-4';
var _justgage$tachyons_elm$Tachyons_Classes$z_3 = 'z-3';
var _justgage$tachyons_elm$Tachyons_Classes$z_2 = 'z-2';
var _justgage$tachyons_elm$Tachyons_Classes$z_1 = 'z-1';
var _justgage$tachyons_elm$Tachyons_Classes$z_0 = 'z-0';
var _justgage$tachyons_elm$Tachyons_Classes$yellow = 'yellow';
var _justgage$tachyons_elm$Tachyons_Classes$ws_normal_ns = 'ws-normal-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ws_normal_m = 'ws-normal-m';
var _justgage$tachyons_elm$Tachyons_Classes$ws_normal_l = 'ws-normal-l';
var _justgage$tachyons_elm$Tachyons_Classes$ws_normal = 'ws-normal';
var _justgage$tachyons_elm$Tachyons_Classes$white_90 = 'white-90';
var _justgage$tachyons_elm$Tachyons_Classes$white_80 = 'white-80';
var _justgage$tachyons_elm$Tachyons_Classes$white_70 = 'white-70';
var _justgage$tachyons_elm$Tachyons_Classes$white_60 = 'white-60';
var _justgage$tachyons_elm$Tachyons_Classes$white_50 = 'white-50';
var _justgage$tachyons_elm$Tachyons_Classes$white_40 = 'white-40';
var _justgage$tachyons_elm$Tachyons_Classes$white_30 = 'white-30';
var _justgage$tachyons_elm$Tachyons_Classes$white_20 = 'white-20';
var _justgage$tachyons_elm$Tachyons_Classes$white_10 = 'white-10';
var _justgage$tachyons_elm$Tachyons_Classes$white = 'white';
var _justgage$tachyons_elm$Tachyons_Classes$washed_yellow = 'washed-yellow';
var _justgage$tachyons_elm$Tachyons_Classes$washed_red = 'washed-red';
var _justgage$tachyons_elm$Tachyons_Classes$washed_green = 'washed-green';
var _justgage$tachyons_elm$Tachyons_Classes$washed_blue = 'washed-blue';
var _justgage$tachyons_elm$Tachyons_Classes$w5_ns = 'w5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w5_m = 'w5-m';
var _justgage$tachyons_elm$Tachyons_Classes$w5_l = 'w5-l';
var _justgage$tachyons_elm$Tachyons_Classes$w5 = 'w5';
var _justgage$tachyons_elm$Tachyons_Classes$w4_ns = 'w4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w4_m = 'w4-m';
var _justgage$tachyons_elm$Tachyons_Classes$w4_l = 'w4-l';
var _justgage$tachyons_elm$Tachyons_Classes$w4 = 'w4';
var _justgage$tachyons_elm$Tachyons_Classes$w3_ns = 'w3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w3_m = 'w3-m';
var _justgage$tachyons_elm$Tachyons_Classes$w3_l = 'w3-l';
var _justgage$tachyons_elm$Tachyons_Classes$w3 = 'w3';
var _justgage$tachyons_elm$Tachyons_Classes$w2_ns = 'w2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w2_m = 'w2-m';
var _justgage$tachyons_elm$Tachyons_Classes$w2_l = 'w2-l';
var _justgage$tachyons_elm$Tachyons_Classes$w2 = 'w2';
var _justgage$tachyons_elm$Tachyons_Classes$w1_ns = 'w1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w1_m = 'w1-m';
var _justgage$tachyons_elm$Tachyons_Classes$w1_l = 'w1-l';
var _justgage$tachyons_elm$Tachyons_Classes$w1 = 'w1';
var _justgage$tachyons_elm$Tachyons_Classes$w_two_thirds_ns = 'w-two-thirds-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_two_thirds_m = 'w-two-thirds-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_two_thirds_l = 'w-two-thirds-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_two_thirds = 'w-two-thirds';
var _justgage$tachyons_elm$Tachyons_Classes$w_third_ns = 'w-third-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_third_m = 'w-third-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_third_l = 'w-third-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_third = 'w-third';
var _justgage$tachyons_elm$Tachyons_Classes$w_auto_ns = 'w-auto-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_auto_m = 'w-auto-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_auto_l = 'w-auto-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_auto = 'w-auto';
var _justgage$tachyons_elm$Tachyons_Classes$w_90_ns = 'w-90-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_90_m = 'w-90-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_90_l = 'w-90-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_90 = 'w-90';
var _justgage$tachyons_elm$Tachyons_Classes$w_80_ns = 'w-80-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_80_m = 'w-80-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_80_l = 'w-80-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_80 = 'w-80';
var _justgage$tachyons_elm$Tachyons_Classes$w_75_ns = 'w-75-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_75_m = 'w-75-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_75_l = 'w-75-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_75 = 'w-75';
var _justgage$tachyons_elm$Tachyons_Classes$w_70_ns = 'w-70-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_70_m = 'w-70-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_70_l = 'w-70-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_70 = 'w-70';
var _justgage$tachyons_elm$Tachyons_Classes$w_60_ns = 'w-60-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_60_m = 'w-60-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_60_l = 'w-60-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_60 = 'w-60';
var _justgage$tachyons_elm$Tachyons_Classes$w_50_ns = 'w-50-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_50_m = 'w-50-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_50_l = 'w-50-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_50 = 'w-50';
var _justgage$tachyons_elm$Tachyons_Classes$w_40_ns = 'w-40-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_40_m = 'w-40-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_40_l = 'w-40-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_40 = 'w-40';
var _justgage$tachyons_elm$Tachyons_Classes$w_34_ns = 'w-34-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_34_m = 'w-34-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_34_l = 'w-34-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_34 = 'w-34';
var _justgage$tachyons_elm$Tachyons_Classes$w_33_ns = 'w-33-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_33_m = 'w-33-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_33_l = 'w-33-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_33 = 'w-33';
var _justgage$tachyons_elm$Tachyons_Classes$w_30_ns = 'w-30-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_30_m = 'w-30-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_30_l = 'w-30-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_30 = 'w-30';
var _justgage$tachyons_elm$Tachyons_Classes$w_25_ns = 'w-25-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_25_m = 'w-25-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_25_l = 'w-25-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_25 = 'w-25';
var _justgage$tachyons_elm$Tachyons_Classes$w_20_ns = 'w-20-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_20_m = 'w-20-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_20_l = 'w-20-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_20 = 'w-20';
var _justgage$tachyons_elm$Tachyons_Classes$w_100_ns = 'w-100-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_100_m = 'w-100-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_100_l = 'w-100-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_100 = 'w-100';
var _justgage$tachyons_elm$Tachyons_Classes$w_10_ns = 'w-10-ns';
var _justgage$tachyons_elm$Tachyons_Classes$w_10_m = 'w-10-m';
var _justgage$tachyons_elm$Tachyons_Classes$w_10_l = 'w-10-l';
var _justgage$tachyons_elm$Tachyons_Classes$w_10 = 'w-10';
var _justgage$tachyons_elm$Tachyons_Classes$vh_75_ns = 'vh-75-ns';
var _justgage$tachyons_elm$Tachyons_Classes$vh_75_m = 'vh-75-m';
var _justgage$tachyons_elm$Tachyons_Classes$vh_75_l = 'vh-75-l';
var _justgage$tachyons_elm$Tachyons_Classes$vh_75 = 'vh-75';
var _justgage$tachyons_elm$Tachyons_Classes$vh_50_ns = 'vh-50-ns';
var _justgage$tachyons_elm$Tachyons_Classes$vh_50_m = 'vh-50-m';
var _justgage$tachyons_elm$Tachyons_Classes$vh_50_l = 'vh-50-l';
var _justgage$tachyons_elm$Tachyons_Classes$vh_50 = 'vh-50';
var _justgage$tachyons_elm$Tachyons_Classes$vh_25_ns = 'vh-25-ns';
var _justgage$tachyons_elm$Tachyons_Classes$vh_25_m = 'vh-25-m';
var _justgage$tachyons_elm$Tachyons_Classes$vh_25_l = 'vh-25-l';
var _justgage$tachyons_elm$Tachyons_Classes$vh_25 = 'vh-25';
var _justgage$tachyons_elm$Tachyons_Classes$vh_100_ns = 'vh-100-ns';
var _justgage$tachyons_elm$Tachyons_Classes$vh_100_m = 'vh-100-m';
var _justgage$tachyons_elm$Tachyons_Classes$vh_100_l = 'vh-100-l';
var _justgage$tachyons_elm$Tachyons_Classes$vh_100 = 'vh-100';
var _justgage$tachyons_elm$Tachyons_Classes$v_top_ns = 'v-top-ns';
var _justgage$tachyons_elm$Tachyons_Classes$v_top_m = 'v-top-m';
var _justgage$tachyons_elm$Tachyons_Classes$v_top_l = 'v-top-l';
var _justgage$tachyons_elm$Tachyons_Classes$v_top = 'v-top';
var _justgage$tachyons_elm$Tachyons_Classes$v_mid_ns = 'v-mid-ns';
var _justgage$tachyons_elm$Tachyons_Classes$v_mid_m = 'v-mid-m';
var _justgage$tachyons_elm$Tachyons_Classes$v_mid_l = 'v-mid-l';
var _justgage$tachyons_elm$Tachyons_Classes$v_mid = 'v-mid';
var _justgage$tachyons_elm$Tachyons_Classes$v_btm_ns = 'v-btm-ns';
var _justgage$tachyons_elm$Tachyons_Classes$v_btm_m = 'v-btm-m';
var _justgage$tachyons_elm$Tachyons_Classes$v_btm_l = 'v-btm-l';
var _justgage$tachyons_elm$Tachyons_Classes$v_btm = 'v-btm';
var _justgage$tachyons_elm$Tachyons_Classes$v_base_ns = 'v-base-ns';
var _justgage$tachyons_elm$Tachyons_Classes$v_base_m = 'v-base-m';
var _justgage$tachyons_elm$Tachyons_Classes$v_base_l = 'v-base-l';
var _justgage$tachyons_elm$Tachyons_Classes$v_base = 'v-base';
var _justgage$tachyons_elm$Tachyons_Classes$underline_ns = 'underline-ns';
var _justgage$tachyons_elm$Tachyons_Classes$underline_m = 'underline-m';
var _justgage$tachyons_elm$Tachyons_Classes$underline_l = 'underline-l';
var _justgage$tachyons_elm$Tachyons_Classes$underline_hover = 'underline-hover';
var _justgage$tachyons_elm$Tachyons_Classes$underline = 'underline';
var _justgage$tachyons_elm$Tachyons_Classes$ttu_ns = 'ttu-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ttu_m = 'ttu-m';
var _justgage$tachyons_elm$Tachyons_Classes$ttu_l = 'ttu-l';
var _justgage$tachyons_elm$Tachyons_Classes$ttu = 'ttu';
var _justgage$tachyons_elm$Tachyons_Classes$ttn_ns = 'ttn-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ttn_m = 'ttn-m';
var _justgage$tachyons_elm$Tachyons_Classes$ttn_l = 'ttn-l';
var _justgage$tachyons_elm$Tachyons_Classes$ttn = 'ttn';
var _justgage$tachyons_elm$Tachyons_Classes$ttl_ns = 'ttl-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ttl_m = 'ttl-m';
var _justgage$tachyons_elm$Tachyons_Classes$ttl_l = 'ttl-l';
var _justgage$tachyons_elm$Tachyons_Classes$ttl = 'ttl';
var _justgage$tachyons_elm$Tachyons_Classes$ttc_ns = 'ttc-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ttc_m = 'ttc-m';
var _justgage$tachyons_elm$Tachyons_Classes$ttc_l = 'ttc-l';
var _justgage$tachyons_elm$Tachyons_Classes$ttc = 'ttc';
var _justgage$tachyons_elm$Tachyons_Classes$truncate_ns = 'truncate-ns';
var _justgage$tachyons_elm$Tachyons_Classes$truncate_m = 'truncate-m';
var _justgage$tachyons_elm$Tachyons_Classes$truncate_l = 'truncate-l';
var _justgage$tachyons_elm$Tachyons_Classes$truncate = 'truncate';
var _justgage$tachyons_elm$Tachyons_Classes$tracked_tight_ns = 'tracked-tight-ns';
var _justgage$tachyons_elm$Tachyons_Classes$tracked_tight_m = 'tracked-tight-m';
var _justgage$tachyons_elm$Tachyons_Classes$tracked_tight_l = 'tracked-tight-l';
var _justgage$tachyons_elm$Tachyons_Classes$tracked_tight = 'tracked-tight';
var _justgage$tachyons_elm$Tachyons_Classes$tracked_ns = 'tracked-ns';
var _justgage$tachyons_elm$Tachyons_Classes$tracked_mega_ns = 'tracked-mega-ns';
var _justgage$tachyons_elm$Tachyons_Classes$tracked_mega_m = 'tracked-mega-m';
var _justgage$tachyons_elm$Tachyons_Classes$tracked_mega_l = 'tracked-mega-l';
var _justgage$tachyons_elm$Tachyons_Classes$tracked_mega = 'tracked-mega';
var _justgage$tachyons_elm$Tachyons_Classes$tracked_m = 'tracked-m';
var _justgage$tachyons_elm$Tachyons_Classes$tracked_l = 'tracked-l';
var _justgage$tachyons_elm$Tachyons_Classes$tracked = 'tracked';
var _justgage$tachyons_elm$Tachyons_Classes$tr_ns = 'tr-ns';
var _justgage$tachyons_elm$Tachyons_Classes$tr_m = 'tr-m';
var _justgage$tachyons_elm$Tachyons_Classes$tr_l = 'tr-l';
var _justgage$tachyons_elm$Tachyons_Classes$tr = 'tr';
var _justgage$tachyons_elm$Tachyons_Classes$top_2_ns = 'top-2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$top_2_m = 'top-2-m';
var _justgage$tachyons_elm$Tachyons_Classes$top_2_l = 'top-2-l';
var _justgage$tachyons_elm$Tachyons_Classes$top_2 = 'top-2';
var _justgage$tachyons_elm$Tachyons_Classes$top_1_ns = 'top-1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$top_1_m = 'top-1-m';
var _justgage$tachyons_elm$Tachyons_Classes$top_1_l = 'top-1-l';
var _justgage$tachyons_elm$Tachyons_Classes$top_1 = 'top-1';
var _justgage$tachyons_elm$Tachyons_Classes$top_0_ns = 'top-0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$top_0_m = 'top-0-m';
var _justgage$tachyons_elm$Tachyons_Classes$top_0_l = 'top-0-l';
var _justgage$tachyons_elm$Tachyons_Classes$top_0 = 'top-0';
var _justgage$tachyons_elm$Tachyons_Classes$top__2_ns = 'top--2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$top__2_m = 'top--2-m';
var _justgage$tachyons_elm$Tachyons_Classes$top__2_l = 'top--2-l';
var _justgage$tachyons_elm$Tachyons_Classes$top__2 = 'top--2';
var _justgage$tachyons_elm$Tachyons_Classes$top__1_ns = 'top--1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$top__1_m = 'top--1-m';
var _justgage$tachyons_elm$Tachyons_Classes$top__1_l = 'top--1-l';
var _justgage$tachyons_elm$Tachyons_Classes$top__1 = 'top--1';
var _justgage$tachyons_elm$Tachyons_Classes$tl_ns = 'tl-ns';
var _justgage$tachyons_elm$Tachyons_Classes$tl_m = 'tl-m';
var _justgage$tachyons_elm$Tachyons_Classes$tl_l = 'tl-l';
var _justgage$tachyons_elm$Tachyons_Classes$tl = 'tl';
var _justgage$tachyons_elm$Tachyons_Classes$times = 'times';
var _justgage$tachyons_elm$Tachyons_Classes$tc_ns = 'tc-ns';
var _justgage$tachyons_elm$Tachyons_Classes$tc_m = 'tc-m';
var _justgage$tachyons_elm$Tachyons_Classes$tc_l = 'tc-l';
var _justgage$tachyons_elm$Tachyons_Classes$tc = 'tc';
var _justgage$tachyons_elm$Tachyons_Classes$system_serif = 'system-serif';
var _justgage$tachyons_elm$Tachyons_Classes$system_sans_serif = 'system-sans-serif';
var _justgage$tachyons_elm$Tachyons_Classes$striped__near_white = 'striped--near-white';
var _justgage$tachyons_elm$Tachyons_Classes$striped__moon_gray = 'striped--moon-gray';
var _justgage$tachyons_elm$Tachyons_Classes$striped__light_silver = 'striped--light-silver';
var _justgage$tachyons_elm$Tachyons_Classes$striped__light_gray = 'striped--light-gray';
var _justgage$tachyons_elm$Tachyons_Classes$stripe_light = 'stripe-light';
var _justgage$tachyons_elm$Tachyons_Classes$stripe_dark = 'stripe-dark';
var _justgage$tachyons_elm$Tachyons_Classes$strike_ns = 'strike-ns';
var _justgage$tachyons_elm$Tachyons_Classes$strike_m = 'strike-m';
var _justgage$tachyons_elm$Tachyons_Classes$strike_l = 'strike-l';
var _justgage$tachyons_elm$Tachyons_Classes$strike = 'strike';
var _justgage$tachyons_elm$Tachyons_Classes$static_ns = 'static-ns';
var _justgage$tachyons_elm$Tachyons_Classes$static_m = 'static-m';
var _justgage$tachyons_elm$Tachyons_Classes$static_l = 'static-l';
var _justgage$tachyons_elm$Tachyons_Classes$static = 'static';
var _justgage$tachyons_elm$Tachyons_Classes$small_caps_ns = 'small-caps-ns';
var _justgage$tachyons_elm$Tachyons_Classes$small_caps_m = 'small-caps-m';
var _justgage$tachyons_elm$Tachyons_Classes$small_caps_l = 'small-caps-l';
var _justgage$tachyons_elm$Tachyons_Classes$small_caps = 'small-caps';
var _justgage$tachyons_elm$Tachyons_Classes$silver = 'silver';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_hover = 'shadow-hover';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_5_ns = 'shadow-5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_5_m = 'shadow-5-m';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_5_l = 'shadow-5-l';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_5 = 'shadow-5';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_4_ns = 'shadow-4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_4_m = 'shadow-4-m';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_4_l = 'shadow-4-l';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_4 = 'shadow-4';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_3_ns = 'shadow-3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_3_m = 'shadow-3-m';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_3_l = 'shadow-3-l';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_3 = 'shadow-3';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_2_ns = 'shadow-2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_2_m = 'shadow-2-m';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_2_l = 'shadow-2-l';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_2 = 'shadow-2';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_1_ns = 'shadow-1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_1_m = 'shadow-1-m';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_1_l = 'shadow-1-l';
var _justgage$tachyons_elm$Tachyons_Classes$shadow_1 = 'shadow-1';
var _justgage$tachyons_elm$Tachyons_Classes$serif = 'serif';
var _justgage$tachyons_elm$Tachyons_Classes$self_stretch_ns = 'self-stretch-ns';
var _justgage$tachyons_elm$Tachyons_Classes$self_stretch_m = 'self-stretch-m';
var _justgage$tachyons_elm$Tachyons_Classes$self_stretch_l = 'self-stretch-l';
var _justgage$tachyons_elm$Tachyons_Classes$self_stretch = 'self-stretch';
var _justgage$tachyons_elm$Tachyons_Classes$self_start_ns = 'self-start-ns';
var _justgage$tachyons_elm$Tachyons_Classes$self_start_m = 'self-start-m';
var _justgage$tachyons_elm$Tachyons_Classes$self_start_l = 'self-start-l';
var _justgage$tachyons_elm$Tachyons_Classes$self_start = 'self-start';
var _justgage$tachyons_elm$Tachyons_Classes$self_end_ns = 'self-end-ns';
var _justgage$tachyons_elm$Tachyons_Classes$self_end_m = 'self-end-m';
var _justgage$tachyons_elm$Tachyons_Classes$self_end_l = 'self-end-l';
var _justgage$tachyons_elm$Tachyons_Classes$self_end = 'self-end';
var _justgage$tachyons_elm$Tachyons_Classes$self_center_ns = 'self-center-ns';
var _justgage$tachyons_elm$Tachyons_Classes$self_center_m = 'self-center-m';
var _justgage$tachyons_elm$Tachyons_Classes$self_center_l = 'self-center-l';
var _justgage$tachyons_elm$Tachyons_Classes$self_center = 'self-center';
var _justgage$tachyons_elm$Tachyons_Classes$self_baseline_ns = 'self-baseline-ns';
var _justgage$tachyons_elm$Tachyons_Classes$self_baseline_m = 'self-baseline-m';
var _justgage$tachyons_elm$Tachyons_Classes$self_baseline_l = 'self-baseline-l';
var _justgage$tachyons_elm$Tachyons_Classes$self_baseline = 'self-baseline';
var _justgage$tachyons_elm$Tachyons_Classes$sans_serif = 'sans-serif';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_90_ns = 'rotate-90-ns';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_90_m = 'rotate-90-m';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_90_l = 'rotate-90-l';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_90 = 'rotate-90';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_45_ns = 'rotate-45-ns';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_45_m = 'rotate-45-m';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_45_l = 'rotate-45-l';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_45 = 'rotate-45';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_315_ns = 'rotate-315-ns';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_315_m = 'rotate-315-m';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_315_l = 'rotate-315-l';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_315 = 'rotate-315';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_270_ns = 'rotate-270-ns';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_270_m = 'rotate-270-m';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_270_l = 'rotate-270-l';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_270 = 'rotate-270';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_225_ns = 'rotate-225-ns';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_225_m = 'rotate-225-m';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_225_l = 'rotate-225-l';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_225 = 'rotate-225';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_180_ns = 'rotate-180-ns';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_180_m = 'rotate-180-m';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_180_l = 'rotate-180-l';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_180 = 'rotate-180';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_135_ns = 'rotate-135-ns';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_135_m = 'rotate-135-m';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_135_l = 'rotate-135-l';
var _justgage$tachyons_elm$Tachyons_Classes$rotate_135 = 'rotate-135';
var _justgage$tachyons_elm$Tachyons_Classes$right_2_ns = 'right-2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$right_2_m = 'right-2-m';
var _justgage$tachyons_elm$Tachyons_Classes$right_2_l = 'right-2-l';
var _justgage$tachyons_elm$Tachyons_Classes$right_2 = 'right-2';
var _justgage$tachyons_elm$Tachyons_Classes$right_1_ns = 'right-1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$right_1_m = 'right-1-m';
var _justgage$tachyons_elm$Tachyons_Classes$right_1_l = 'right-1-l';
var _justgage$tachyons_elm$Tachyons_Classes$right_1 = 'right-1';
var _justgage$tachyons_elm$Tachyons_Classes$right_0_ns = 'right-0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$right_0_m = 'right-0-m';
var _justgage$tachyons_elm$Tachyons_Classes$right_0_l = 'right-0-l';
var _justgage$tachyons_elm$Tachyons_Classes$right_0 = 'right-0';
var _justgage$tachyons_elm$Tachyons_Classes$right__2_ns = 'right--2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$right__2_m = 'right--2-m';
var _justgage$tachyons_elm$Tachyons_Classes$right__2_l = 'right--2-l';
var _justgage$tachyons_elm$Tachyons_Classes$right__2 = 'right--2';
var _justgage$tachyons_elm$Tachyons_Classes$right__1_ns = 'right--1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$right__1_m = 'right--1-m';
var _justgage$tachyons_elm$Tachyons_Classes$right__1_l = 'right--1-l';
var _justgage$tachyons_elm$Tachyons_Classes$right__1 = 'right--1';
var _justgage$tachyons_elm$Tachyons_Classes$relative_ns = 'relative-ns';
var _justgage$tachyons_elm$Tachyons_Classes$relative_m = 'relative-m';
var _justgage$tachyons_elm$Tachyons_Classes$relative_l = 'relative-l';
var _justgage$tachyons_elm$Tachyons_Classes$relative = 'relative';
var _justgage$tachyons_elm$Tachyons_Classes$red = 'red';
var _justgage$tachyons_elm$Tachyons_Classes$pv7_ns = 'pv7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pv7_m = 'pv7-m';
var _justgage$tachyons_elm$Tachyons_Classes$pv7_l = 'pv7-l';
var _justgage$tachyons_elm$Tachyons_Classes$pv7 = 'pv7';
var _justgage$tachyons_elm$Tachyons_Classes$pv6_ns = 'pv6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pv6_m = 'pv6-m';
var _justgage$tachyons_elm$Tachyons_Classes$pv6_l = 'pv6-l';
var _justgage$tachyons_elm$Tachyons_Classes$pv6 = 'pv6';
var _justgage$tachyons_elm$Tachyons_Classes$pv5_ns = 'pv5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pv5_m = 'pv5-m';
var _justgage$tachyons_elm$Tachyons_Classes$pv5_l = 'pv5-l';
var _justgage$tachyons_elm$Tachyons_Classes$pv5 = 'pv5';
var _justgage$tachyons_elm$Tachyons_Classes$pv4_ns = 'pv4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pv4_m = 'pv4-m';
var _justgage$tachyons_elm$Tachyons_Classes$pv4_l = 'pv4-l';
var _justgage$tachyons_elm$Tachyons_Classes$pv4 = 'pv4';
var _justgage$tachyons_elm$Tachyons_Classes$pv3_ns = 'pv3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pv3_m = 'pv3-m';
var _justgage$tachyons_elm$Tachyons_Classes$pv3_l = 'pv3-l';
var _justgage$tachyons_elm$Tachyons_Classes$pv3 = 'pv3';
var _justgage$tachyons_elm$Tachyons_Classes$pv2_ns = 'pv2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pv2_m = 'pv2-m';
var _justgage$tachyons_elm$Tachyons_Classes$pv2_l = 'pv2-l';
var _justgage$tachyons_elm$Tachyons_Classes$pv2 = 'pv2';
var _justgage$tachyons_elm$Tachyons_Classes$pv1_ns = 'pv1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pv1_m = 'pv1-m';
var _justgage$tachyons_elm$Tachyons_Classes$pv1_l = 'pv1-l';
var _justgage$tachyons_elm$Tachyons_Classes$pv1 = 'pv1';
var _justgage$tachyons_elm$Tachyons_Classes$pv0_ns = 'pv0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pv0_m = 'pv0-m';
var _justgage$tachyons_elm$Tachyons_Classes$pv0_l = 'pv0-l';
var _justgage$tachyons_elm$Tachyons_Classes$pv0 = 'pv0';
var _justgage$tachyons_elm$Tachyons_Classes$purple = 'purple';
var _justgage$tachyons_elm$Tachyons_Classes$pt7_ns = 'pt7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pt7_m = 'pt7-m';
var _justgage$tachyons_elm$Tachyons_Classes$pt7_l = 'pt7-l';
var _justgage$tachyons_elm$Tachyons_Classes$pt7 = 'pt7';
var _justgage$tachyons_elm$Tachyons_Classes$pt6_ns = 'pt6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pt6_m = 'pt6-m';
var _justgage$tachyons_elm$Tachyons_Classes$pt6_l = 'pt6-l';
var _justgage$tachyons_elm$Tachyons_Classes$pt6 = 'pt6';
var _justgage$tachyons_elm$Tachyons_Classes$pt5_ns = 'pt5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pt5_m = 'pt5-m';
var _justgage$tachyons_elm$Tachyons_Classes$pt5_l = 'pt5-l';
var _justgage$tachyons_elm$Tachyons_Classes$pt5 = 'pt5';
var _justgage$tachyons_elm$Tachyons_Classes$pt4_ns = 'pt4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pt4_m = 'pt4-m';
var _justgage$tachyons_elm$Tachyons_Classes$pt4_l = 'pt4-l';
var _justgage$tachyons_elm$Tachyons_Classes$pt4 = 'pt4';
var _justgage$tachyons_elm$Tachyons_Classes$pt3_ns = 'pt3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pt3_m = 'pt3-m';
var _justgage$tachyons_elm$Tachyons_Classes$pt3_l = 'pt3-l';
var _justgage$tachyons_elm$Tachyons_Classes$pt3 = 'pt3';
var _justgage$tachyons_elm$Tachyons_Classes$pt2_ns = 'pt2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pt2_m = 'pt2-m';
var _justgage$tachyons_elm$Tachyons_Classes$pt2_l = 'pt2-l';
var _justgage$tachyons_elm$Tachyons_Classes$pt2 = 'pt2';
var _justgage$tachyons_elm$Tachyons_Classes$pt1_ns = 'pt1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pt1_m = 'pt1-m';
var _justgage$tachyons_elm$Tachyons_Classes$pt1_l = 'pt1-l';
var _justgage$tachyons_elm$Tachyons_Classes$pt1 = 'pt1';
var _justgage$tachyons_elm$Tachyons_Classes$pt0_ns = 'pt0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pt0_m = 'pt0-m';
var _justgage$tachyons_elm$Tachyons_Classes$pt0_l = 'pt0-l';
var _justgage$tachyons_elm$Tachyons_Classes$pt0 = 'pt0';
var _justgage$tachyons_elm$Tachyons_Classes$pre_ns = 'pre-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pre_m = 'pre-m';
var _justgage$tachyons_elm$Tachyons_Classes$pre_l = 'pre-l';
var _justgage$tachyons_elm$Tachyons_Classes$pre = 'pre';
var _justgage$tachyons_elm$Tachyons_Classes$pr7_ns = 'pr7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pr7_m = 'pr7-m';
var _justgage$tachyons_elm$Tachyons_Classes$pr7_l = 'pr7-l';
var _justgage$tachyons_elm$Tachyons_Classes$pr7 = 'pr7';
var _justgage$tachyons_elm$Tachyons_Classes$pr6_ns = 'pr6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pr6_m = 'pr6-m';
var _justgage$tachyons_elm$Tachyons_Classes$pr6_l = 'pr6-l';
var _justgage$tachyons_elm$Tachyons_Classes$pr6 = 'pr6';
var _justgage$tachyons_elm$Tachyons_Classes$pr5_ns = 'pr5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pr5_m = 'pr5-m';
var _justgage$tachyons_elm$Tachyons_Classes$pr5_l = 'pr5-l';
var _justgage$tachyons_elm$Tachyons_Classes$pr5 = 'pr5';
var _justgage$tachyons_elm$Tachyons_Classes$pr4_ns = 'pr4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pr4_m = 'pr4-m';
var _justgage$tachyons_elm$Tachyons_Classes$pr4_l = 'pr4-l';
var _justgage$tachyons_elm$Tachyons_Classes$pr4 = 'pr4';
var _justgage$tachyons_elm$Tachyons_Classes$pr3_ns = 'pr3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pr3_m = 'pr3-m';
var _justgage$tachyons_elm$Tachyons_Classes$pr3_l = 'pr3-l';
var _justgage$tachyons_elm$Tachyons_Classes$pr3 = 'pr3';
var _justgage$tachyons_elm$Tachyons_Classes$pr2_ns = 'pr2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pr2_m = 'pr2-m';
var _justgage$tachyons_elm$Tachyons_Classes$pr2_l = 'pr2-l';
var _justgage$tachyons_elm$Tachyons_Classes$pr2 = 'pr2';
var _justgage$tachyons_elm$Tachyons_Classes$pr1_ns = 'pr1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pr1_m = 'pr1-m';
var _justgage$tachyons_elm$Tachyons_Classes$pr1_l = 'pr1-l';
var _justgage$tachyons_elm$Tachyons_Classes$pr1 = 'pr1';
var _justgage$tachyons_elm$Tachyons_Classes$pr0_ns = 'pr0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pr0_m = 'pr0-m';
var _justgage$tachyons_elm$Tachyons_Classes$pr0_l = 'pr0-l';
var _justgage$tachyons_elm$Tachyons_Classes$pr0 = 'pr0';
var _justgage$tachyons_elm$Tachyons_Classes$pointer = 'pointer';
var _justgage$tachyons_elm$Tachyons_Classes$pl7_ns = 'pl7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pl7_m = 'pl7-m';
var _justgage$tachyons_elm$Tachyons_Classes$pl7_l = 'pl7-l';
var _justgage$tachyons_elm$Tachyons_Classes$pl7 = 'pl7';
var _justgage$tachyons_elm$Tachyons_Classes$pl6_ns = 'pl6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pl6_m = 'pl6-m';
var _justgage$tachyons_elm$Tachyons_Classes$pl6_l = 'pl6-l';
var _justgage$tachyons_elm$Tachyons_Classes$pl6 = 'pl6';
var _justgage$tachyons_elm$Tachyons_Classes$pl5_ns = 'pl5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pl5_m = 'pl5-m';
var _justgage$tachyons_elm$Tachyons_Classes$pl5_l = 'pl5-l';
var _justgage$tachyons_elm$Tachyons_Classes$pl5 = 'pl5';
var _justgage$tachyons_elm$Tachyons_Classes$pl4_ns = 'pl4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pl4_m = 'pl4-m';
var _justgage$tachyons_elm$Tachyons_Classes$pl4_l = 'pl4-l';
var _justgage$tachyons_elm$Tachyons_Classes$pl4 = 'pl4';
var _justgage$tachyons_elm$Tachyons_Classes$pl3_ns = 'pl3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pl3_m = 'pl3-m';
var _justgage$tachyons_elm$Tachyons_Classes$pl3_l = 'pl3-l';
var _justgage$tachyons_elm$Tachyons_Classes$pl3 = 'pl3';
var _justgage$tachyons_elm$Tachyons_Classes$pl2_ns = 'pl2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pl2_m = 'pl2-m';
var _justgage$tachyons_elm$Tachyons_Classes$pl2_l = 'pl2-l';
var _justgage$tachyons_elm$Tachyons_Classes$pl2 = 'pl2';
var _justgage$tachyons_elm$Tachyons_Classes$pl1_ns = 'pl1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pl1_m = 'pl1-m';
var _justgage$tachyons_elm$Tachyons_Classes$pl1_l = 'pl1-l';
var _justgage$tachyons_elm$Tachyons_Classes$pl1 = 'pl1';
var _justgage$tachyons_elm$Tachyons_Classes$pl0_ns = 'pl0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pl0_m = 'pl0-m';
var _justgage$tachyons_elm$Tachyons_Classes$pl0_l = 'pl0-l';
var _justgage$tachyons_elm$Tachyons_Classes$pl0 = 'pl0';
var _justgage$tachyons_elm$Tachyons_Classes$pink = 'pink';
var _justgage$tachyons_elm$Tachyons_Classes$ph7_ns = 'ph7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ph7_m = 'ph7-m';
var _justgage$tachyons_elm$Tachyons_Classes$ph7_l = 'ph7-l';
var _justgage$tachyons_elm$Tachyons_Classes$ph7 = 'ph7';
var _justgage$tachyons_elm$Tachyons_Classes$ph6_ns = 'ph6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ph6_m = 'ph6-m';
var _justgage$tachyons_elm$Tachyons_Classes$ph6_l = 'ph6-l';
var _justgage$tachyons_elm$Tachyons_Classes$ph6 = 'ph6';
var _justgage$tachyons_elm$Tachyons_Classes$ph5_ns = 'ph5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ph5_m = 'ph5-m';
var _justgage$tachyons_elm$Tachyons_Classes$ph5_l = 'ph5-l';
var _justgage$tachyons_elm$Tachyons_Classes$ph5 = 'ph5';
var _justgage$tachyons_elm$Tachyons_Classes$ph4_ns = 'ph4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ph4_m = 'ph4-m';
var _justgage$tachyons_elm$Tachyons_Classes$ph4_l = 'ph4-l';
var _justgage$tachyons_elm$Tachyons_Classes$ph4 = 'ph4';
var _justgage$tachyons_elm$Tachyons_Classes$ph3_ns = 'ph3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ph3_m = 'ph3-m';
var _justgage$tachyons_elm$Tachyons_Classes$ph3_l = 'ph3-l';
var _justgage$tachyons_elm$Tachyons_Classes$ph3 = 'ph3';
var _justgage$tachyons_elm$Tachyons_Classes$ph2_ns = 'ph2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ph2_m = 'ph2-m';
var _justgage$tachyons_elm$Tachyons_Classes$ph2_l = 'ph2-l';
var _justgage$tachyons_elm$Tachyons_Classes$ph2 = 'ph2';
var _justgage$tachyons_elm$Tachyons_Classes$ph1_ns = 'ph1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ph1_m = 'ph1-m';
var _justgage$tachyons_elm$Tachyons_Classes$ph1_l = 'ph1-l';
var _justgage$tachyons_elm$Tachyons_Classes$ph1 = 'ph1';
var _justgage$tachyons_elm$Tachyons_Classes$ph0_ns = 'ph0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ph0_m = 'ph0-m';
var _justgage$tachyons_elm$Tachyons_Classes$ph0_l = 'ph0-l';
var _justgage$tachyons_elm$Tachyons_Classes$ph0 = 'ph0';
var _justgage$tachyons_elm$Tachyons_Classes$pb7_ns = 'pb7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pb7_m = 'pb7-m';
var _justgage$tachyons_elm$Tachyons_Classes$pb7_l = 'pb7-l';
var _justgage$tachyons_elm$Tachyons_Classes$pb7 = 'pb7';
var _justgage$tachyons_elm$Tachyons_Classes$pb6_ns = 'pb6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pb6_m = 'pb6-m';
var _justgage$tachyons_elm$Tachyons_Classes$pb6_l = 'pb6-l';
var _justgage$tachyons_elm$Tachyons_Classes$pb6 = 'pb6';
var _justgage$tachyons_elm$Tachyons_Classes$pb5_ns = 'pb5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pb5_m = 'pb5-m';
var _justgage$tachyons_elm$Tachyons_Classes$pb5_l = 'pb5-l';
var _justgage$tachyons_elm$Tachyons_Classes$pb5 = 'pb5';
var _justgage$tachyons_elm$Tachyons_Classes$pb4_ns = 'pb4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pb4_m = 'pb4-m';
var _justgage$tachyons_elm$Tachyons_Classes$pb4_l = 'pb4-l';
var _justgage$tachyons_elm$Tachyons_Classes$pb4 = 'pb4';
var _justgage$tachyons_elm$Tachyons_Classes$pb3_ns = 'pb3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pb3_m = 'pb3-m';
var _justgage$tachyons_elm$Tachyons_Classes$pb3_l = 'pb3-l';
var _justgage$tachyons_elm$Tachyons_Classes$pb3 = 'pb3';
var _justgage$tachyons_elm$Tachyons_Classes$pb2_ns = 'pb2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pb2_m = 'pb2-m';
var _justgage$tachyons_elm$Tachyons_Classes$pb2_l = 'pb2-l';
var _justgage$tachyons_elm$Tachyons_Classes$pb2 = 'pb2';
var _justgage$tachyons_elm$Tachyons_Classes$pb1_ns = 'pb1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pb1_m = 'pb1-m';
var _justgage$tachyons_elm$Tachyons_Classes$pb1_l = 'pb1-l';
var _justgage$tachyons_elm$Tachyons_Classes$pb1 = 'pb1';
var _justgage$tachyons_elm$Tachyons_Classes$pb0_ns = 'pb0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pb0_m = 'pb0-m';
var _justgage$tachyons_elm$Tachyons_Classes$pb0_l = 'pb0-l';
var _justgage$tachyons_elm$Tachyons_Classes$pb0 = 'pb0';
var _justgage$tachyons_elm$Tachyons_Classes$pa7_ns = 'pa7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pa7_m = 'pa7-m';
var _justgage$tachyons_elm$Tachyons_Classes$pa7_l = 'pa7-l';
var _justgage$tachyons_elm$Tachyons_Classes$pa7 = 'pa7';
var _justgage$tachyons_elm$Tachyons_Classes$pa6_ns = 'pa6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pa6_m = 'pa6-m';
var _justgage$tachyons_elm$Tachyons_Classes$pa6_l = 'pa6-l';
var _justgage$tachyons_elm$Tachyons_Classes$pa6 = 'pa6';
var _justgage$tachyons_elm$Tachyons_Classes$pa5_ns = 'pa5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pa5_m = 'pa5-m';
var _justgage$tachyons_elm$Tachyons_Classes$pa5_l = 'pa5-l';
var _justgage$tachyons_elm$Tachyons_Classes$pa5 = 'pa5';
var _justgage$tachyons_elm$Tachyons_Classes$pa4_ns = 'pa4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pa4_m = 'pa4-m';
var _justgage$tachyons_elm$Tachyons_Classes$pa4_l = 'pa4-l';
var _justgage$tachyons_elm$Tachyons_Classes$pa4 = 'pa4';
var _justgage$tachyons_elm$Tachyons_Classes$pa3_ns = 'pa3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pa3_m = 'pa3-m';
var _justgage$tachyons_elm$Tachyons_Classes$pa3_l = 'pa3-l';
var _justgage$tachyons_elm$Tachyons_Classes$pa3 = 'pa3';
var _justgage$tachyons_elm$Tachyons_Classes$pa2_ns = 'pa2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pa2_m = 'pa2-m';
var _justgage$tachyons_elm$Tachyons_Classes$pa2_l = 'pa2-l';
var _justgage$tachyons_elm$Tachyons_Classes$pa2 = 'pa2';
var _justgage$tachyons_elm$Tachyons_Classes$pa1_ns = 'pa1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pa1_m = 'pa1-m';
var _justgage$tachyons_elm$Tachyons_Classes$pa1_l = 'pa1-l';
var _justgage$tachyons_elm$Tachyons_Classes$pa1 = 'pa1';
var _justgage$tachyons_elm$Tachyons_Classes$pa0_ns = 'pa0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$pa0_m = 'pa0-m';
var _justgage$tachyons_elm$Tachyons_Classes$pa0_l = 'pa0-l';
var _justgage$tachyons_elm$Tachyons_Classes$pa0 = 'pa0';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_visible_ns = 'overflow-y-visible-ns';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_visible_m = 'overflow-y-visible-m';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_visible_l = 'overflow-y-visible-l';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_visible = 'overflow-y-visible';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_scroll_ns = 'overflow-y-scroll-ns';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_scroll_m = 'overflow-y-scroll-m';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_scroll_l = 'overflow-y-scroll-l';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_scroll = 'overflow-y-scroll';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_hidden_ns = 'overflow-y-hidden-ns';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_hidden_m = 'overflow-y-hidden-m';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_hidden_l = 'overflow-y-hidden-l';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_hidden = 'overflow-y-hidden';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_auto_ns = 'overflow-y-auto-ns';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_auto_m = 'overflow-y-auto-m';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_auto_l = 'overflow-y-auto-l';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_y_auto = 'overflow-y-auto';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_visible_ns = 'overflow-x-visible-ns';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_visible_m = 'overflow-x-visible-m';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_visible_l = 'overflow-x-visible-l';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_visible = 'overflow-x-visible';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_scroll_ns = 'overflow-x-scroll-ns';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_scroll_m = 'overflow-x-scroll-m';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_scroll_l = 'overflow-x-scroll-l';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_scroll = 'overflow-x-scroll';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_hidden_ns = 'overflow-x-hidden-ns';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_hidden_m = 'overflow-x-hidden-m';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_hidden_l = 'overflow-x-hidden-l';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_hidden = 'overflow-x-hidden';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_auto_ns = 'overflow-x-auto-ns';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_auto_m = 'overflow-x-auto-m';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_auto_l = 'overflow-x-auto-l';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_x_auto = 'overflow-x-auto';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_visible_ns = 'overflow-visible-ns';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_visible_m = 'overflow-visible-m';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_visible_l = 'overflow-visible-l';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_visible = 'overflow-visible';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_scroll_ns = 'overflow-scroll-ns';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_scroll_m = 'overflow-scroll-m';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_scroll_l = 'overflow-scroll-l';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_scroll = 'overflow-scroll';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_hidden_ns = 'overflow-hidden-ns';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_hidden_m = 'overflow-hidden-m';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_hidden_l = 'overflow-hidden-l';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_hidden = 'overflow-hidden';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_container = 'overflow-container';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_auto_ns = 'overflow-auto-ns';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_auto_m = 'overflow-auto-m';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_auto_l = 'overflow-auto-l';
var _justgage$tachyons_elm$Tachyons_Classes$overflow_auto = 'overflow-auto';
var _justgage$tachyons_elm$Tachyons_Classes$outline_transparent_ns = 'outline-transparent-ns';
var _justgage$tachyons_elm$Tachyons_Classes$outline_transparent_m = 'outline-transparent-m';
var _justgage$tachyons_elm$Tachyons_Classes$outline_transparent_l = 'outline-transparent-l';
var _justgage$tachyons_elm$Tachyons_Classes$outline_transparent = 'outline-transparent';
var _justgage$tachyons_elm$Tachyons_Classes$outline_ns = 'outline-ns';
var _justgage$tachyons_elm$Tachyons_Classes$outline_m = 'outline-m';
var _justgage$tachyons_elm$Tachyons_Classes$outline_l = 'outline-l';
var _justgage$tachyons_elm$Tachyons_Classes$outline_0_ns = 'outline-0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$outline_0_m = 'outline-0-m';
var _justgage$tachyons_elm$Tachyons_Classes$outline_0_l = 'outline-0-l';
var _justgage$tachyons_elm$Tachyons_Classes$outline_0 = 'outline-0';
var _justgage$tachyons_elm$Tachyons_Classes$outline = 'outline';
var _justgage$tachyons_elm$Tachyons_Classes$order_last_ns = 'order-last-ns';
var _justgage$tachyons_elm$Tachyons_Classes$order_last_m = 'order-last-m';
var _justgage$tachyons_elm$Tachyons_Classes$order_last_l = 'order-last-l';
var _justgage$tachyons_elm$Tachyons_Classes$order_last = 'order-last';
var _justgage$tachyons_elm$Tachyons_Classes$order_8_ns = 'order-8-ns';
var _justgage$tachyons_elm$Tachyons_Classes$order_8_m = 'order-8-m';
var _justgage$tachyons_elm$Tachyons_Classes$order_8_l = 'order-8-l';
var _justgage$tachyons_elm$Tachyons_Classes$order_8 = 'order-8';
var _justgage$tachyons_elm$Tachyons_Classes$order_7_ns = 'order-7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$order_7_m = 'order-7-m';
var _justgage$tachyons_elm$Tachyons_Classes$order_7_l = 'order-7-l';
var _justgage$tachyons_elm$Tachyons_Classes$order_7 = 'order-7';
var _justgage$tachyons_elm$Tachyons_Classes$order_6_ns = 'order-6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$order_6_m = 'order-6-m';
var _justgage$tachyons_elm$Tachyons_Classes$order_6_l = 'order-6-l';
var _justgage$tachyons_elm$Tachyons_Classes$order_6 = 'order-6';
var _justgage$tachyons_elm$Tachyons_Classes$order_5_ns = 'order-5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$order_5_m = 'order-5-m';
var _justgage$tachyons_elm$Tachyons_Classes$order_5_l = 'order-5-l';
var _justgage$tachyons_elm$Tachyons_Classes$order_5 = 'order-5';
var _justgage$tachyons_elm$Tachyons_Classes$order_4_ns = 'order-4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$order_4_m = 'order-4-m';
var _justgage$tachyons_elm$Tachyons_Classes$order_4_l = 'order-4-l';
var _justgage$tachyons_elm$Tachyons_Classes$order_4 = 'order-4';
var _justgage$tachyons_elm$Tachyons_Classes$order_3_ns = 'order-3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$order_3_m = 'order-3-m';
var _justgage$tachyons_elm$Tachyons_Classes$order_3_l = 'order-3-l';
var _justgage$tachyons_elm$Tachyons_Classes$order_3 = 'order-3';
var _justgage$tachyons_elm$Tachyons_Classes$order_2_ns = 'order-2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$order_2_m = 'order-2-m';
var _justgage$tachyons_elm$Tachyons_Classes$order_2_l = 'order-2-l';
var _justgage$tachyons_elm$Tachyons_Classes$order_2 = 'order-2';
var _justgage$tachyons_elm$Tachyons_Classes$order_1_ns = 'order-1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$order_1_m = 'order-1-m';
var _justgage$tachyons_elm$Tachyons_Classes$order_1_l = 'order-1-l';
var _justgage$tachyons_elm$Tachyons_Classes$order_1 = 'order-1';
var _justgage$tachyons_elm$Tachyons_Classes$order_0_ns = 'order-0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$order_0_m = 'order-0-m';
var _justgage$tachyons_elm$Tachyons_Classes$order_0_l = 'order-0-l';
var _justgage$tachyons_elm$Tachyons_Classes$order_0 = 'order-0';
var _justgage$tachyons_elm$Tachyons_Classes$orange = 'orange';
var _justgage$tachyons_elm$Tachyons_Classes$o_90 = 'o-90';
var _justgage$tachyons_elm$Tachyons_Classes$o_80 = 'o-80';
var _justgage$tachyons_elm$Tachyons_Classes$o_70 = 'o-70';
var _justgage$tachyons_elm$Tachyons_Classes$o_60 = 'o-60';
var _justgage$tachyons_elm$Tachyons_Classes$o_50 = 'o-50';
var _justgage$tachyons_elm$Tachyons_Classes$o_40 = 'o-40';
var _justgage$tachyons_elm$Tachyons_Classes$o_30 = 'o-30';
var _justgage$tachyons_elm$Tachyons_Classes$o_20 = 'o-20';
var _justgage$tachyons_elm$Tachyons_Classes$o_100 = 'o-100';
var _justgage$tachyons_elm$Tachyons_Classes$o_10 = 'o-10';
var _justgage$tachyons_elm$Tachyons_Classes$o_05 = 'o-05';
var _justgage$tachyons_elm$Tachyons_Classes$o_025 = 'o-025';
var _justgage$tachyons_elm$Tachyons_Classes$o_0 = 'o-0';
var _justgage$tachyons_elm$Tachyons_Classes$nt7_ns = 'nt7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nt7_m = 'nt7-m';
var _justgage$tachyons_elm$Tachyons_Classes$nt7_l = 'nt7-l';
var _justgage$tachyons_elm$Tachyons_Classes$nt7 = 'nt7';
var _justgage$tachyons_elm$Tachyons_Classes$nt6_ns = 'nt6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nt6_m = 'nt6-m';
var _justgage$tachyons_elm$Tachyons_Classes$nt6_l = 'nt6-l';
var _justgage$tachyons_elm$Tachyons_Classes$nt6 = 'nt6';
var _justgage$tachyons_elm$Tachyons_Classes$nt5_ns = 'nt5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nt5_m = 'nt5-m';
var _justgage$tachyons_elm$Tachyons_Classes$nt5_l = 'nt5-l';
var _justgage$tachyons_elm$Tachyons_Classes$nt5 = 'nt5';
var _justgage$tachyons_elm$Tachyons_Classes$nt4_ns = 'nt4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nt4_m = 'nt4-m';
var _justgage$tachyons_elm$Tachyons_Classes$nt4_l = 'nt4-l';
var _justgage$tachyons_elm$Tachyons_Classes$nt4 = 'nt4';
var _justgage$tachyons_elm$Tachyons_Classes$nt3_ns = 'nt3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nt3_m = 'nt3-m';
var _justgage$tachyons_elm$Tachyons_Classes$nt3_l = 'nt3-l';
var _justgage$tachyons_elm$Tachyons_Classes$nt3 = 'nt3';
var _justgage$tachyons_elm$Tachyons_Classes$nt2_ns = 'nt2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nt2_m = 'nt2-m';
var _justgage$tachyons_elm$Tachyons_Classes$nt2_l = 'nt2-l';
var _justgage$tachyons_elm$Tachyons_Classes$nt2 = 'nt2';
var _justgage$tachyons_elm$Tachyons_Classes$nt1_ns = 'nt1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nt1_m = 'nt1-m';
var _justgage$tachyons_elm$Tachyons_Classes$nt1_l = 'nt1-l';
var _justgage$tachyons_elm$Tachyons_Classes$nt1 = 'nt1';
var _justgage$tachyons_elm$Tachyons_Classes$nr7_ns = 'nr7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nr7_m = 'nr7-m';
var _justgage$tachyons_elm$Tachyons_Classes$nr7_l = 'nr7-l';
var _justgage$tachyons_elm$Tachyons_Classes$nr7 = 'nr7';
var _justgage$tachyons_elm$Tachyons_Classes$nr6_ns = 'nr6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nr6_m = 'nr6-m';
var _justgage$tachyons_elm$Tachyons_Classes$nr6_l = 'nr6-l';
var _justgage$tachyons_elm$Tachyons_Classes$nr6 = 'nr6';
var _justgage$tachyons_elm$Tachyons_Classes$nr5_ns = 'nr5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nr5_m = 'nr5-m';
var _justgage$tachyons_elm$Tachyons_Classes$nr5_l = 'nr5-l';
var _justgage$tachyons_elm$Tachyons_Classes$nr5 = 'nr5';
var _justgage$tachyons_elm$Tachyons_Classes$nr4_ns = 'nr4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nr4_m = 'nr4-m';
var _justgage$tachyons_elm$Tachyons_Classes$nr4_l = 'nr4-l';
var _justgage$tachyons_elm$Tachyons_Classes$nr4 = 'nr4';
var _justgage$tachyons_elm$Tachyons_Classes$nr3_ns = 'nr3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nr3_m = 'nr3-m';
var _justgage$tachyons_elm$Tachyons_Classes$nr3_l = 'nr3-l';
var _justgage$tachyons_elm$Tachyons_Classes$nr3 = 'nr3';
var _justgage$tachyons_elm$Tachyons_Classes$nr2_ns = 'nr2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nr2_m = 'nr2-m';
var _justgage$tachyons_elm$Tachyons_Classes$nr2_l = 'nr2-l';
var _justgage$tachyons_elm$Tachyons_Classes$nr2 = 'nr2';
var _justgage$tachyons_elm$Tachyons_Classes$nr1_ns = 'nr1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nr1_m = 'nr1-m';
var _justgage$tachyons_elm$Tachyons_Classes$nr1_l = 'nr1-l';
var _justgage$tachyons_elm$Tachyons_Classes$nr1 = 'nr1';
var _justgage$tachyons_elm$Tachyons_Classes$nowrap_ns = 'nowrap-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nowrap_m = 'nowrap-m';
var _justgage$tachyons_elm$Tachyons_Classes$nowrap_l = 'nowrap-l';
var _justgage$tachyons_elm$Tachyons_Classes$nowrap = 'nowrap';
var _justgage$tachyons_elm$Tachyons_Classes$normal_ns = 'normal-ns';
var _justgage$tachyons_elm$Tachyons_Classes$normal_m = 'normal-m';
var _justgage$tachyons_elm$Tachyons_Classes$normal_l = 'normal-l';
var _justgage$tachyons_elm$Tachyons_Classes$normal = 'normal';
var _justgage$tachyons_elm$Tachyons_Classes$no_underline_ns = 'no-underline-ns';
var _justgage$tachyons_elm$Tachyons_Classes$no_underline_m = 'no-underline-m';
var _justgage$tachyons_elm$Tachyons_Classes$no_underline_l = 'no-underline-l';
var _justgage$tachyons_elm$Tachyons_Classes$no_underline = 'no-underline';
var _justgage$tachyons_elm$Tachyons_Classes$nl7_ns = 'nl7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nl7_m = 'nl7-m';
var _justgage$tachyons_elm$Tachyons_Classes$nl7_l = 'nl7-l';
var _justgage$tachyons_elm$Tachyons_Classes$nl7 = 'nl7';
var _justgage$tachyons_elm$Tachyons_Classes$nl6_ns = 'nl6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nl6_m = 'nl6-m';
var _justgage$tachyons_elm$Tachyons_Classes$nl6_l = 'nl6-l';
var _justgage$tachyons_elm$Tachyons_Classes$nl6 = 'nl6';
var _justgage$tachyons_elm$Tachyons_Classes$nl5_ns = 'nl5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nl5_m = 'nl5-m';
var _justgage$tachyons_elm$Tachyons_Classes$nl5_l = 'nl5-l';
var _justgage$tachyons_elm$Tachyons_Classes$nl5 = 'nl5';
var _justgage$tachyons_elm$Tachyons_Classes$nl4_ns = 'nl4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nl4_m = 'nl4-m';
var _justgage$tachyons_elm$Tachyons_Classes$nl4_l = 'nl4-l';
var _justgage$tachyons_elm$Tachyons_Classes$nl4 = 'nl4';
var _justgage$tachyons_elm$Tachyons_Classes$nl3_ns = 'nl3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nl3_m = 'nl3-m';
var _justgage$tachyons_elm$Tachyons_Classes$nl3_l = 'nl3-l';
var _justgage$tachyons_elm$Tachyons_Classes$nl3 = 'nl3';
var _justgage$tachyons_elm$Tachyons_Classes$nl2_ns = 'nl2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nl2_m = 'nl2-m';
var _justgage$tachyons_elm$Tachyons_Classes$nl2_l = 'nl2-l';
var _justgage$tachyons_elm$Tachyons_Classes$nl2 = 'nl2';
var _justgage$tachyons_elm$Tachyons_Classes$nl1_ns = 'nl1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nl1_m = 'nl1-m';
var _justgage$tachyons_elm$Tachyons_Classes$nl1_l = 'nl1-l';
var _justgage$tachyons_elm$Tachyons_Classes$nl1 = 'nl1';
var _justgage$tachyons_elm$Tachyons_Classes$nested_list_reset = 'nested-list-reset';
var _justgage$tachyons_elm$Tachyons_Classes$nested_links = 'nested-links';
var _justgage$tachyons_elm$Tachyons_Classes$nested_img = 'nested-img';
var _justgage$tachyons_elm$Tachyons_Classes$nested_headline_line_height = 'nested-headline-line-height';
var _justgage$tachyons_elm$Tachyons_Classes$nested_copy_seperator = 'nested-copy-seperator';
var _justgage$tachyons_elm$Tachyons_Classes$nested_copy_line_height = 'nested-copy-line-height';
var _justgage$tachyons_elm$Tachyons_Classes$nested_copy_indent = 'nested-copy-indent';
var _justgage$tachyons_elm$Tachyons_Classes$near_white = 'near-white';
var _justgage$tachyons_elm$Tachyons_Classes$near_black = 'near-black';
var _justgage$tachyons_elm$Tachyons_Classes$nb7_ns = 'nb7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nb7_m = 'nb7-m';
var _justgage$tachyons_elm$Tachyons_Classes$nb7_l = 'nb7-l';
var _justgage$tachyons_elm$Tachyons_Classes$nb7 = 'nb7';
var _justgage$tachyons_elm$Tachyons_Classes$nb6_ns = 'nb6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nb6_m = 'nb6-m';
var _justgage$tachyons_elm$Tachyons_Classes$nb6_l = 'nb6-l';
var _justgage$tachyons_elm$Tachyons_Classes$nb6 = 'nb6';
var _justgage$tachyons_elm$Tachyons_Classes$nb5_ns = 'nb5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nb5_m = 'nb5-m';
var _justgage$tachyons_elm$Tachyons_Classes$nb5_l = 'nb5-l';
var _justgage$tachyons_elm$Tachyons_Classes$nb5 = 'nb5';
var _justgage$tachyons_elm$Tachyons_Classes$nb4_ns = 'nb4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nb4_m = 'nb4-m';
var _justgage$tachyons_elm$Tachyons_Classes$nb4_l = 'nb4-l';
var _justgage$tachyons_elm$Tachyons_Classes$nb4 = 'nb4';
var _justgage$tachyons_elm$Tachyons_Classes$nb3_ns = 'nb3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nb3_m = 'nb3-m';
var _justgage$tachyons_elm$Tachyons_Classes$nb3_l = 'nb3-l';
var _justgage$tachyons_elm$Tachyons_Classes$nb3 = 'nb3';
var _justgage$tachyons_elm$Tachyons_Classes$nb2_ns = 'nb2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nb2_m = 'nb2-m';
var _justgage$tachyons_elm$Tachyons_Classes$nb2_l = 'nb2-l';
var _justgage$tachyons_elm$Tachyons_Classes$nb2 = 'nb2';
var _justgage$tachyons_elm$Tachyons_Classes$nb1_ns = 'nb1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$nb1_m = 'nb1-m';
var _justgage$tachyons_elm$Tachyons_Classes$nb1_l = 'nb1-l';
var _justgage$tachyons_elm$Tachyons_Classes$nb1 = 'nb1';
var _justgage$tachyons_elm$Tachyons_Classes$navy = 'navy';
var _justgage$tachyons_elm$Tachyons_Classes$na7_ns = 'na7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$na7_m = 'na7-m';
var _justgage$tachyons_elm$Tachyons_Classes$na7_l = 'na7-l';
var _justgage$tachyons_elm$Tachyons_Classes$na7 = 'na7';
var _justgage$tachyons_elm$Tachyons_Classes$na6_ns = 'na6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$na6_m = 'na6-m';
var _justgage$tachyons_elm$Tachyons_Classes$na6_l = 'na6-l';
var _justgage$tachyons_elm$Tachyons_Classes$na6 = 'na6';
var _justgage$tachyons_elm$Tachyons_Classes$na5_ns = 'na5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$na5_m = 'na5-m';
var _justgage$tachyons_elm$Tachyons_Classes$na5_l = 'na5-l';
var _justgage$tachyons_elm$Tachyons_Classes$na5 = 'na5';
var _justgage$tachyons_elm$Tachyons_Classes$na4_ns = 'na4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$na4_m = 'na4-m';
var _justgage$tachyons_elm$Tachyons_Classes$na4_l = 'na4-l';
var _justgage$tachyons_elm$Tachyons_Classes$na4 = 'na4';
var _justgage$tachyons_elm$Tachyons_Classes$na3_ns = 'na3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$na3_m = 'na3-m';
var _justgage$tachyons_elm$Tachyons_Classes$na3_l = 'na3-l';
var _justgage$tachyons_elm$Tachyons_Classes$na3 = 'na3';
var _justgage$tachyons_elm$Tachyons_Classes$na2_ns = 'na2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$na2_m = 'na2-m';
var _justgage$tachyons_elm$Tachyons_Classes$na2_l = 'na2-l';
var _justgage$tachyons_elm$Tachyons_Classes$na2 = 'na2';
var _justgage$tachyons_elm$Tachyons_Classes$na1_ns = 'na1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$na1_m = 'na1-m';
var _justgage$tachyons_elm$Tachyons_Classes$na1_l = 'na1-l';
var _justgage$tachyons_elm$Tachyons_Classes$na1 = 'na1';
var _justgage$tachyons_elm$Tachyons_Classes$mw9_ns = 'mw9-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mw9_m = 'mw9-m';
var _justgage$tachyons_elm$Tachyons_Classes$mw9_l = 'mw9-l';
var _justgage$tachyons_elm$Tachyons_Classes$mw9 = 'mw9';
var _justgage$tachyons_elm$Tachyons_Classes$mw8_ns = 'mw8-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mw8_m = 'mw8-m';
var _justgage$tachyons_elm$Tachyons_Classes$mw8_l = 'mw8-l';
var _justgage$tachyons_elm$Tachyons_Classes$mw8 = 'mw8';
var _justgage$tachyons_elm$Tachyons_Classes$mw7_ns = 'mw7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mw7_m = 'mw7-m';
var _justgage$tachyons_elm$Tachyons_Classes$mw7_l = 'mw7-l';
var _justgage$tachyons_elm$Tachyons_Classes$mw7 = 'mw7';
var _justgage$tachyons_elm$Tachyons_Classes$mw6_ns = 'mw6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mw6_m = 'mw6-m';
var _justgage$tachyons_elm$Tachyons_Classes$mw6_l = 'mw6-l';
var _justgage$tachyons_elm$Tachyons_Classes$mw6 = 'mw6';
var _justgage$tachyons_elm$Tachyons_Classes$mw5_ns = 'mw5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mw5_m = 'mw5-m';
var _justgage$tachyons_elm$Tachyons_Classes$mw5_l = 'mw5-l';
var _justgage$tachyons_elm$Tachyons_Classes$mw5 = 'mw5';
var _justgage$tachyons_elm$Tachyons_Classes$mw4_ns = 'mw4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mw4_m = 'mw4-m';
var _justgage$tachyons_elm$Tachyons_Classes$mw4_l = 'mw4-l';
var _justgage$tachyons_elm$Tachyons_Classes$mw4 = 'mw4';
var _justgage$tachyons_elm$Tachyons_Classes$mw3_ns = 'mw3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mw3_m = 'mw3-m';
var _justgage$tachyons_elm$Tachyons_Classes$mw3_l = 'mw3-l';
var _justgage$tachyons_elm$Tachyons_Classes$mw3 = 'mw3';
var _justgage$tachyons_elm$Tachyons_Classes$mw2_ns = 'mw2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mw2_m = 'mw2-m';
var _justgage$tachyons_elm$Tachyons_Classes$mw2_l = 'mw2-l';
var _justgage$tachyons_elm$Tachyons_Classes$mw2 = 'mw2';
var _justgage$tachyons_elm$Tachyons_Classes$mw1_ns = 'mw1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mw1_m = 'mw1-m';
var _justgage$tachyons_elm$Tachyons_Classes$mw1_l = 'mw1-l';
var _justgage$tachyons_elm$Tachyons_Classes$mw1 = 'mw1';
var _justgage$tachyons_elm$Tachyons_Classes$mw_none_ns = 'mw-none-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mw_none_m = 'mw-none-m';
var _justgage$tachyons_elm$Tachyons_Classes$mw_none_l = 'mw-none-l';
var _justgage$tachyons_elm$Tachyons_Classes$mw_none = 'mw-none';
var _justgage$tachyons_elm$Tachyons_Classes$mw_100_ns = 'mw-100-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mw_100_m = 'mw-100-m';
var _justgage$tachyons_elm$Tachyons_Classes$mw_100_l = 'mw-100-l';
var _justgage$tachyons_elm$Tachyons_Classes$mw_100 = 'mw-100';
var _justgage$tachyons_elm$Tachyons_Classes$mv7_ns = 'mv7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mv7_m = 'mv7-m';
var _justgage$tachyons_elm$Tachyons_Classes$mv7_l = 'mv7-l';
var _justgage$tachyons_elm$Tachyons_Classes$mv7 = 'mv7';
var _justgage$tachyons_elm$Tachyons_Classes$mv6_ns = 'mv6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mv6_m = 'mv6-m';
var _justgage$tachyons_elm$Tachyons_Classes$mv6_l = 'mv6-l';
var _justgage$tachyons_elm$Tachyons_Classes$mv6 = 'mv6';
var _justgage$tachyons_elm$Tachyons_Classes$mv5_ns = 'mv5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mv5_m = 'mv5-m';
var _justgage$tachyons_elm$Tachyons_Classes$mv5_l = 'mv5-l';
var _justgage$tachyons_elm$Tachyons_Classes$mv5 = 'mv5';
var _justgage$tachyons_elm$Tachyons_Classes$mv4_ns = 'mv4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mv4_m = 'mv4-m';
var _justgage$tachyons_elm$Tachyons_Classes$mv4_l = 'mv4-l';
var _justgage$tachyons_elm$Tachyons_Classes$mv4 = 'mv4';
var _justgage$tachyons_elm$Tachyons_Classes$mv3_ns = 'mv3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mv3_m = 'mv3-m';
var _justgage$tachyons_elm$Tachyons_Classes$mv3_l = 'mv3-l';
var _justgage$tachyons_elm$Tachyons_Classes$mv3 = 'mv3';
var _justgage$tachyons_elm$Tachyons_Classes$mv2_ns = 'mv2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mv2_m = 'mv2-m';
var _justgage$tachyons_elm$Tachyons_Classes$mv2_l = 'mv2-l';
var _justgage$tachyons_elm$Tachyons_Classes$mv2 = 'mv2';
var _justgage$tachyons_elm$Tachyons_Classes$mv1_ns = 'mv1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mv1_m = 'mv1-m';
var _justgage$tachyons_elm$Tachyons_Classes$mv1_l = 'mv1-l';
var _justgage$tachyons_elm$Tachyons_Classes$mv1 = 'mv1';
var _justgage$tachyons_elm$Tachyons_Classes$mv0_ns = 'mv0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mv0_m = 'mv0-m';
var _justgage$tachyons_elm$Tachyons_Classes$mv0_l = 'mv0-l';
var _justgage$tachyons_elm$Tachyons_Classes$mv0 = 'mv0';
var _justgage$tachyons_elm$Tachyons_Classes$mt7_ns = 'mt7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mt7_m = 'mt7-m';
var _justgage$tachyons_elm$Tachyons_Classes$mt7_l = 'mt7-l';
var _justgage$tachyons_elm$Tachyons_Classes$mt7 = 'mt7';
var _justgage$tachyons_elm$Tachyons_Classes$mt6_ns = 'mt6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mt6_m = 'mt6-m';
var _justgage$tachyons_elm$Tachyons_Classes$mt6_l = 'mt6-l';
var _justgage$tachyons_elm$Tachyons_Classes$mt6 = 'mt6';
var _justgage$tachyons_elm$Tachyons_Classes$mt5_ns = 'mt5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mt5_m = 'mt5-m';
var _justgage$tachyons_elm$Tachyons_Classes$mt5_l = 'mt5-l';
var _justgage$tachyons_elm$Tachyons_Classes$mt5 = 'mt5';
var _justgage$tachyons_elm$Tachyons_Classes$mt4_ns = 'mt4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mt4_m = 'mt4-m';
var _justgage$tachyons_elm$Tachyons_Classes$mt4_l = 'mt4-l';
var _justgage$tachyons_elm$Tachyons_Classes$mt4 = 'mt4';
var _justgage$tachyons_elm$Tachyons_Classes$mt3_ns = 'mt3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mt3_m = 'mt3-m';
var _justgage$tachyons_elm$Tachyons_Classes$mt3_l = 'mt3-l';
var _justgage$tachyons_elm$Tachyons_Classes$mt3 = 'mt3';
var _justgage$tachyons_elm$Tachyons_Classes$mt2_ns = 'mt2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mt2_m = 'mt2-m';
var _justgage$tachyons_elm$Tachyons_Classes$mt2_l = 'mt2-l';
var _justgage$tachyons_elm$Tachyons_Classes$mt2 = 'mt2';
var _justgage$tachyons_elm$Tachyons_Classes$mt1_ns = 'mt1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mt1_m = 'mt1-m';
var _justgage$tachyons_elm$Tachyons_Classes$mt1_l = 'mt1-l';
var _justgage$tachyons_elm$Tachyons_Classes$mt1 = 'mt1';
var _justgage$tachyons_elm$Tachyons_Classes$mt0_ns = 'mt0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mt0_m = 'mt0-m';
var _justgage$tachyons_elm$Tachyons_Classes$mt0_l = 'mt0-l';
var _justgage$tachyons_elm$Tachyons_Classes$mt0 = 'mt0';
var _justgage$tachyons_elm$Tachyons_Classes$mr7_ns = 'mr7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mr7_m = 'mr7-m';
var _justgage$tachyons_elm$Tachyons_Classes$mr7_l = 'mr7-l';
var _justgage$tachyons_elm$Tachyons_Classes$mr7 = 'mr7';
var _justgage$tachyons_elm$Tachyons_Classes$mr6_ns = 'mr6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mr6_m = 'mr6-m';
var _justgage$tachyons_elm$Tachyons_Classes$mr6_l = 'mr6-l';
var _justgage$tachyons_elm$Tachyons_Classes$mr6 = 'mr6';
var _justgage$tachyons_elm$Tachyons_Classes$mr5_ns = 'mr5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mr5_m = 'mr5-m';
var _justgage$tachyons_elm$Tachyons_Classes$mr5_l = 'mr5-l';
var _justgage$tachyons_elm$Tachyons_Classes$mr5 = 'mr5';
var _justgage$tachyons_elm$Tachyons_Classes$mr4_ns = 'mr4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mr4_m = 'mr4-m';
var _justgage$tachyons_elm$Tachyons_Classes$mr4_l = 'mr4-l';
var _justgage$tachyons_elm$Tachyons_Classes$mr4 = 'mr4';
var _justgage$tachyons_elm$Tachyons_Classes$mr3_ns = 'mr3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mr3_m = 'mr3-m';
var _justgage$tachyons_elm$Tachyons_Classes$mr3_l = 'mr3-l';
var _justgage$tachyons_elm$Tachyons_Classes$mr3 = 'mr3';
var _justgage$tachyons_elm$Tachyons_Classes$mr2_ns = 'mr2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mr2_m = 'mr2-m';
var _justgage$tachyons_elm$Tachyons_Classes$mr2_l = 'mr2-l';
var _justgage$tachyons_elm$Tachyons_Classes$mr2 = 'mr2';
var _justgage$tachyons_elm$Tachyons_Classes$mr1_ns = 'mr1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mr1_m = 'mr1-m';
var _justgage$tachyons_elm$Tachyons_Classes$mr1_l = 'mr1-l';
var _justgage$tachyons_elm$Tachyons_Classes$mr1 = 'mr1';
var _justgage$tachyons_elm$Tachyons_Classes$mr0_ns = 'mr0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mr0_m = 'mr0-m';
var _justgage$tachyons_elm$Tachyons_Classes$mr0_l = 'mr0-l';
var _justgage$tachyons_elm$Tachyons_Classes$mr0 = 'mr0';
var _justgage$tachyons_elm$Tachyons_Classes$moon_gray = 'moon-gray';
var _justgage$tachyons_elm$Tachyons_Classes$ml7_ns = 'ml7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ml7_m = 'ml7-m';
var _justgage$tachyons_elm$Tachyons_Classes$ml7_l = 'ml7-l';
var _justgage$tachyons_elm$Tachyons_Classes$ml7 = 'ml7';
var _justgage$tachyons_elm$Tachyons_Classes$ml6_ns = 'ml6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ml6_m = 'ml6-m';
var _justgage$tachyons_elm$Tachyons_Classes$ml6_l = 'ml6-l';
var _justgage$tachyons_elm$Tachyons_Classes$ml6 = 'ml6';
var _justgage$tachyons_elm$Tachyons_Classes$ml5_ns = 'ml5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ml5_m = 'ml5-m';
var _justgage$tachyons_elm$Tachyons_Classes$ml5_l = 'ml5-l';
var _justgage$tachyons_elm$Tachyons_Classes$ml5 = 'ml5';
var _justgage$tachyons_elm$Tachyons_Classes$ml4_ns = 'ml4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ml4_m = 'ml4-m';
var _justgage$tachyons_elm$Tachyons_Classes$ml4_l = 'ml4-l';
var _justgage$tachyons_elm$Tachyons_Classes$ml4 = 'ml4';
var _justgage$tachyons_elm$Tachyons_Classes$ml3_ns = 'ml3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ml3_m = 'ml3-m';
var _justgage$tachyons_elm$Tachyons_Classes$ml3_l = 'ml3-l';
var _justgage$tachyons_elm$Tachyons_Classes$ml3 = 'ml3';
var _justgage$tachyons_elm$Tachyons_Classes$ml2_ns = 'ml2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ml2_m = 'ml2-m';
var _justgage$tachyons_elm$Tachyons_Classes$ml2_l = 'ml2-l';
var _justgage$tachyons_elm$Tachyons_Classes$ml2 = 'ml2';
var _justgage$tachyons_elm$Tachyons_Classes$ml1_ns = 'ml1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ml1_m = 'ml1-m';
var _justgage$tachyons_elm$Tachyons_Classes$ml1_l = 'ml1-l';
var _justgage$tachyons_elm$Tachyons_Classes$ml1 = 'ml1';
var _justgage$tachyons_elm$Tachyons_Classes$ml0_ns = 'ml0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ml0_m = 'ml0-m';
var _justgage$tachyons_elm$Tachyons_Classes$ml0_l = 'ml0-l';
var _justgage$tachyons_elm$Tachyons_Classes$ml0 = 'ml0';
var _justgage$tachyons_elm$Tachyons_Classes$min_vh_100_ns = 'min-vh-100-ns';
var _justgage$tachyons_elm$Tachyons_Classes$min_vh_100_m = 'min-vh-100-m';
var _justgage$tachyons_elm$Tachyons_Classes$min_vh_100_l = 'min-vh-100-l';
var _justgage$tachyons_elm$Tachyons_Classes$min_vh_100 = 'min-vh-100';
var _justgage$tachyons_elm$Tachyons_Classes$min_h_100_ns = 'min-h-100-ns';
var _justgage$tachyons_elm$Tachyons_Classes$min_h_100_m = 'min-h-100-m';
var _justgage$tachyons_elm$Tachyons_Classes$min_h_100_l = 'min-h-100-l';
var _justgage$tachyons_elm$Tachyons_Classes$min_h_100 = 'min-h-100';
var _justgage$tachyons_elm$Tachyons_Classes$mid_gray = 'mid-gray';
var _justgage$tachyons_elm$Tachyons_Classes$mh7_ns = 'mh7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mh7_m = 'mh7-m';
var _justgage$tachyons_elm$Tachyons_Classes$mh7_l = 'mh7-l';
var _justgage$tachyons_elm$Tachyons_Classes$mh7 = 'mh7';
var _justgage$tachyons_elm$Tachyons_Classes$mh6_ns = 'mh6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mh6_m = 'mh6-m';
var _justgage$tachyons_elm$Tachyons_Classes$mh6_l = 'mh6-l';
var _justgage$tachyons_elm$Tachyons_Classes$mh6 = 'mh6';
var _justgage$tachyons_elm$Tachyons_Classes$mh5_ns = 'mh5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mh5_m = 'mh5-m';
var _justgage$tachyons_elm$Tachyons_Classes$mh5_l = 'mh5-l';
var _justgage$tachyons_elm$Tachyons_Classes$mh5 = 'mh5';
var _justgage$tachyons_elm$Tachyons_Classes$mh4_ns = 'mh4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mh4_m = 'mh4-m';
var _justgage$tachyons_elm$Tachyons_Classes$mh4_l = 'mh4-l';
var _justgage$tachyons_elm$Tachyons_Classes$mh4 = 'mh4';
var _justgage$tachyons_elm$Tachyons_Classes$mh3_ns = 'mh3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mh3_m = 'mh3-m';
var _justgage$tachyons_elm$Tachyons_Classes$mh3_l = 'mh3-l';
var _justgage$tachyons_elm$Tachyons_Classes$mh3 = 'mh3';
var _justgage$tachyons_elm$Tachyons_Classes$mh2_ns = 'mh2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mh2_m = 'mh2-m';
var _justgage$tachyons_elm$Tachyons_Classes$mh2_l = 'mh2-l';
var _justgage$tachyons_elm$Tachyons_Classes$mh2 = 'mh2';
var _justgage$tachyons_elm$Tachyons_Classes$mh1_ns = 'mh1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mh1_m = 'mh1-m';
var _justgage$tachyons_elm$Tachyons_Classes$mh1_l = 'mh1-l';
var _justgage$tachyons_elm$Tachyons_Classes$mh1 = 'mh1';
var _justgage$tachyons_elm$Tachyons_Classes$mh0_ns = 'mh0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mh0_m = 'mh0-m';
var _justgage$tachyons_elm$Tachyons_Classes$mh0_l = 'mh0-l';
var _justgage$tachyons_elm$Tachyons_Classes$mh0 = 'mh0';
var _justgage$tachyons_elm$Tachyons_Classes$measure_wide_ns = 'measure-wide-ns';
var _justgage$tachyons_elm$Tachyons_Classes$measure_wide_m = 'measure-wide-m';
var _justgage$tachyons_elm$Tachyons_Classes$measure_wide_l = 'measure-wide-l';
var _justgage$tachyons_elm$Tachyons_Classes$measure_wide = 'measure-wide';
var _justgage$tachyons_elm$Tachyons_Classes$measure_ns = 'measure-ns';
var _justgage$tachyons_elm$Tachyons_Classes$measure_narrow_ns = 'measure-narrow-ns';
var _justgage$tachyons_elm$Tachyons_Classes$measure_narrow_m = 'measure-narrow-m';
var _justgage$tachyons_elm$Tachyons_Classes$measure_narrow_l = 'measure-narrow-l';
var _justgage$tachyons_elm$Tachyons_Classes$measure_narrow = 'measure-narrow';
var _justgage$tachyons_elm$Tachyons_Classes$measure_m = 'measure-m';
var _justgage$tachyons_elm$Tachyons_Classes$measure_l = 'measure-l';
var _justgage$tachyons_elm$Tachyons_Classes$measure = 'measure';
var _justgage$tachyons_elm$Tachyons_Classes$mb7_ns = 'mb7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mb7_m = 'mb7-m';
var _justgage$tachyons_elm$Tachyons_Classes$mb7_l = 'mb7-l';
var _justgage$tachyons_elm$Tachyons_Classes$mb7 = 'mb7';
var _justgage$tachyons_elm$Tachyons_Classes$mb6_ns = 'mb6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mb6_m = 'mb6-m';
var _justgage$tachyons_elm$Tachyons_Classes$mb6_l = 'mb6-l';
var _justgage$tachyons_elm$Tachyons_Classes$mb6 = 'mb6';
var _justgage$tachyons_elm$Tachyons_Classes$mb5_ns = 'mb5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mb5_m = 'mb5-m';
var _justgage$tachyons_elm$Tachyons_Classes$mb5_l = 'mb5-l';
var _justgage$tachyons_elm$Tachyons_Classes$mb5 = 'mb5';
var _justgage$tachyons_elm$Tachyons_Classes$mb4_ns = 'mb4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mb4_m = 'mb4-m';
var _justgage$tachyons_elm$Tachyons_Classes$mb4_l = 'mb4-l';
var _justgage$tachyons_elm$Tachyons_Classes$mb4 = 'mb4';
var _justgage$tachyons_elm$Tachyons_Classes$mb3_ns = 'mb3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mb3_m = 'mb3-m';
var _justgage$tachyons_elm$Tachyons_Classes$mb3_l = 'mb3-l';
var _justgage$tachyons_elm$Tachyons_Classes$mb3 = 'mb3';
var _justgage$tachyons_elm$Tachyons_Classes$mb2_ns = 'mb2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mb2_m = 'mb2-m';
var _justgage$tachyons_elm$Tachyons_Classes$mb2_l = 'mb2-l';
var _justgage$tachyons_elm$Tachyons_Classes$mb2 = 'mb2';
var _justgage$tachyons_elm$Tachyons_Classes$mb1_ns = 'mb1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mb1_m = 'mb1-m';
var _justgage$tachyons_elm$Tachyons_Classes$mb1_l = 'mb1-l';
var _justgage$tachyons_elm$Tachyons_Classes$mb1 = 'mb1';
var _justgage$tachyons_elm$Tachyons_Classes$mb0_ns = 'mb0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$mb0_m = 'mb0-m';
var _justgage$tachyons_elm$Tachyons_Classes$mb0_l = 'mb0-l';
var _justgage$tachyons_elm$Tachyons_Classes$mb0 = 'mb0';
var _justgage$tachyons_elm$Tachyons_Classes$ma7_ns = 'ma7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ma7_m = 'ma7-m';
var _justgage$tachyons_elm$Tachyons_Classes$ma7_l = 'ma7-l';
var _justgage$tachyons_elm$Tachyons_Classes$ma7 = 'ma7';
var _justgage$tachyons_elm$Tachyons_Classes$ma6_ns = 'ma6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ma6_m = 'ma6-m';
var _justgage$tachyons_elm$Tachyons_Classes$ma6_l = 'ma6-l';
var _justgage$tachyons_elm$Tachyons_Classes$ma6 = 'ma6';
var _justgage$tachyons_elm$Tachyons_Classes$ma5_ns = 'ma5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ma5_m = 'ma5-m';
var _justgage$tachyons_elm$Tachyons_Classes$ma5_l = 'ma5-l';
var _justgage$tachyons_elm$Tachyons_Classes$ma5 = 'ma5';
var _justgage$tachyons_elm$Tachyons_Classes$ma4_ns = 'ma4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ma4_m = 'ma4-m';
var _justgage$tachyons_elm$Tachyons_Classes$ma4_l = 'ma4-l';
var _justgage$tachyons_elm$Tachyons_Classes$ma4 = 'ma4';
var _justgage$tachyons_elm$Tachyons_Classes$ma3_ns = 'ma3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ma3_m = 'ma3-m';
var _justgage$tachyons_elm$Tachyons_Classes$ma3_l = 'ma3-l';
var _justgage$tachyons_elm$Tachyons_Classes$ma3 = 'ma3';
var _justgage$tachyons_elm$Tachyons_Classes$ma2_ns = 'ma2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ma2_m = 'ma2-m';
var _justgage$tachyons_elm$Tachyons_Classes$ma2_l = 'ma2-l';
var _justgage$tachyons_elm$Tachyons_Classes$ma2 = 'ma2';
var _justgage$tachyons_elm$Tachyons_Classes$ma1_ns = 'ma1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ma1_m = 'ma1-m';
var _justgage$tachyons_elm$Tachyons_Classes$ma1_l = 'ma1-l';
var _justgage$tachyons_elm$Tachyons_Classes$ma1 = 'ma1';
var _justgage$tachyons_elm$Tachyons_Classes$ma0_ns = 'ma0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ma0_m = 'ma0-m';
var _justgage$tachyons_elm$Tachyons_Classes$ma0_l = 'ma0-l';
var _justgage$tachyons_elm$Tachyons_Classes$ma0 = 'ma0';
var _justgage$tachyons_elm$Tachyons_Classes$list = 'list';
var _justgage$tachyons_elm$Tachyons_Classes$link = 'link';
var _justgage$tachyons_elm$Tachyons_Classes$lightest_blue = 'lightest-blue';
var _justgage$tachyons_elm$Tachyons_Classes$light_yellow = 'light-yellow';
var _justgage$tachyons_elm$Tachyons_Classes$light_silver = 'light-silver';
var _justgage$tachyons_elm$Tachyons_Classes$light_red = 'light-red';
var _justgage$tachyons_elm$Tachyons_Classes$light_purple = 'light-purple';
var _justgage$tachyons_elm$Tachyons_Classes$light_pink = 'light-pink';
var _justgage$tachyons_elm$Tachyons_Classes$light_green = 'light-green';
var _justgage$tachyons_elm$Tachyons_Classes$light_gray = 'light-gray';
var _justgage$tachyons_elm$Tachyons_Classes$light_blue = 'light-blue';
var _justgage$tachyons_elm$Tachyons_Classes$lh_title_ns = 'lh-title-ns';
var _justgage$tachyons_elm$Tachyons_Classes$lh_title_m = 'lh-title-m';
var _justgage$tachyons_elm$Tachyons_Classes$lh_title_l = 'lh-title-l';
var _justgage$tachyons_elm$Tachyons_Classes$lh_title = 'lh-title';
var _justgage$tachyons_elm$Tachyons_Classes$lh_solid_ns = 'lh-solid-ns';
var _justgage$tachyons_elm$Tachyons_Classes$lh_solid_m = 'lh-solid-m';
var _justgage$tachyons_elm$Tachyons_Classes$lh_solid_l = 'lh-solid-l';
var _justgage$tachyons_elm$Tachyons_Classes$lh_solid = 'lh-solid';
var _justgage$tachyons_elm$Tachyons_Classes$lh_copy_ns = 'lh-copy-ns';
var _justgage$tachyons_elm$Tachyons_Classes$lh_copy_m = 'lh-copy-m';
var _justgage$tachyons_elm$Tachyons_Classes$lh_copy_l = 'lh-copy-l';
var _justgage$tachyons_elm$Tachyons_Classes$lh_copy = 'lh-copy';
var _justgage$tachyons_elm$Tachyons_Classes$left_2_ns = 'left-2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$left_2_m = 'left-2-m';
var _justgage$tachyons_elm$Tachyons_Classes$left_2_l = 'left-2-l';
var _justgage$tachyons_elm$Tachyons_Classes$left_2 = 'left-2';
var _justgage$tachyons_elm$Tachyons_Classes$left_1_ns = 'left-1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$left_1_m = 'left-1-m';
var _justgage$tachyons_elm$Tachyons_Classes$left_1_l = 'left-1-l';
var _justgage$tachyons_elm$Tachyons_Classes$left_1 = 'left-1';
var _justgage$tachyons_elm$Tachyons_Classes$left_0_ns = 'left-0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$left_0_m = 'left-0-m';
var _justgage$tachyons_elm$Tachyons_Classes$left_0_l = 'left-0-l';
var _justgage$tachyons_elm$Tachyons_Classes$left_0 = 'left-0';
var _justgage$tachyons_elm$Tachyons_Classes$left__2_ns = 'left--2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$left__2_m = 'left--2-m';
var _justgage$tachyons_elm$Tachyons_Classes$left__2_l = 'left--2-l';
var _justgage$tachyons_elm$Tachyons_Classes$left__2 = 'left--2';
var _justgage$tachyons_elm$Tachyons_Classes$left__1_ns = 'left--1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$left__1_m = 'left--1-m';
var _justgage$tachyons_elm$Tachyons_Classes$left__1_l = 'left--1-l';
var _justgage$tachyons_elm$Tachyons_Classes$left__1 = 'left--1';
var _justgage$tachyons_elm$Tachyons_Classes$justify_start_ns = 'justify-start-ns';
var _justgage$tachyons_elm$Tachyons_Classes$justify_start_m = 'justify-start-m';
var _justgage$tachyons_elm$Tachyons_Classes$justify_start_l = 'justify-start-l';
var _justgage$tachyons_elm$Tachyons_Classes$justify_start = 'justify-start';
var _justgage$tachyons_elm$Tachyons_Classes$justify_end_ns = 'justify-end-ns';
var _justgage$tachyons_elm$Tachyons_Classes$justify_end_m = 'justify-end-m';
var _justgage$tachyons_elm$Tachyons_Classes$justify_end_l = 'justify-end-l';
var _justgage$tachyons_elm$Tachyons_Classes$justify_end = 'justify-end';
var _justgage$tachyons_elm$Tachyons_Classes$justify_center_ns = 'justify-center-ns';
var _justgage$tachyons_elm$Tachyons_Classes$justify_center_m = 'justify-center-m';
var _justgage$tachyons_elm$Tachyons_Classes$justify_center_l = 'justify-center-l';
var _justgage$tachyons_elm$Tachyons_Classes$justify_center = 'justify-center';
var _justgage$tachyons_elm$Tachyons_Classes$justify_between_ns = 'justify-between-ns';
var _justgage$tachyons_elm$Tachyons_Classes$justify_between_m = 'justify-between-m';
var _justgage$tachyons_elm$Tachyons_Classes$justify_between_l = 'justify-between-l';
var _justgage$tachyons_elm$Tachyons_Classes$justify_between = 'justify-between';
var _justgage$tachyons_elm$Tachyons_Classes$justify_around_ns = 'justify-around-ns';
var _justgage$tachyons_elm$Tachyons_Classes$justify_around_m = 'justify-around-m';
var _justgage$tachyons_elm$Tachyons_Classes$justify_around_l = 'justify-around-l';
var _justgage$tachyons_elm$Tachyons_Classes$justify_around = 'justify-around';
var _justgage$tachyons_elm$Tachyons_Classes$items_stretch_ns = 'items-stretch-ns';
var _justgage$tachyons_elm$Tachyons_Classes$items_stretch_m = 'items-stretch-m';
var _justgage$tachyons_elm$Tachyons_Classes$items_stretch_l = 'items-stretch-l';
var _justgage$tachyons_elm$Tachyons_Classes$items_stretch = 'items-stretch';
var _justgage$tachyons_elm$Tachyons_Classes$items_start_ns = 'items-start-ns';
var _justgage$tachyons_elm$Tachyons_Classes$items_start_m = 'items-start-m';
var _justgage$tachyons_elm$Tachyons_Classes$items_start_l = 'items-start-l';
var _justgage$tachyons_elm$Tachyons_Classes$items_start = 'items-start';
var _justgage$tachyons_elm$Tachyons_Classes$items_end_ns = 'items-end-ns';
var _justgage$tachyons_elm$Tachyons_Classes$items_end_m = 'items-end-m';
var _justgage$tachyons_elm$Tachyons_Classes$items_end_l = 'items-end-l';
var _justgage$tachyons_elm$Tachyons_Classes$items_end = 'items-end';
var _justgage$tachyons_elm$Tachyons_Classes$items_center_ns = 'items-center-ns';
var _justgage$tachyons_elm$Tachyons_Classes$items_center_m = 'items-center-m';
var _justgage$tachyons_elm$Tachyons_Classes$items_center_l = 'items-center-l';
var _justgage$tachyons_elm$Tachyons_Classes$items_center = 'items-center';
var _justgage$tachyons_elm$Tachyons_Classes$items_baseline_ns = 'items-baseline-ns';
var _justgage$tachyons_elm$Tachyons_Classes$items_baseline_m = 'items-baseline-m';
var _justgage$tachyons_elm$Tachyons_Classes$items_baseline_l = 'items-baseline-l';
var _justgage$tachyons_elm$Tachyons_Classes$items_baseline = 'items-baseline';
var _justgage$tachyons_elm$Tachyons_Classes$input_reset = 'input-reset';
var _justgage$tachyons_elm$Tachyons_Classes$inline_flex_ns = 'inline-flex-ns';
var _justgage$tachyons_elm$Tachyons_Classes$inline_flex_m = 'inline-flex-m';
var _justgage$tachyons_elm$Tachyons_Classes$inline_flex_l = 'inline-flex-l';
var _justgage$tachyons_elm$Tachyons_Classes$inline_flex = 'inline-flex';
var _justgage$tachyons_elm$Tachyons_Classes$indent_ns = 'indent-ns';
var _justgage$tachyons_elm$Tachyons_Classes$indent_m = 'indent-m';
var _justgage$tachyons_elm$Tachyons_Classes$indent_l = 'indent-l';
var _justgage$tachyons_elm$Tachyons_Classes$indent = 'indent';
var _justgage$tachyons_elm$Tachyons_Classes$i_ns = 'i-ns';
var _justgage$tachyons_elm$Tachyons_Classes$i_m = 'i-m';
var _justgage$tachyons_elm$Tachyons_Classes$i_l = 'i-l';
var _justgage$tachyons_elm$Tachyons_Classes$i = 'i';
var _justgage$tachyons_elm$Tachyons_Classes$hover_yellow = 'hover-yellow';
var _justgage$tachyons_elm$Tachyons_Classes$hover_white_90 = 'hover-white-90';
var _justgage$tachyons_elm$Tachyons_Classes$hover_white_80 = 'hover-white-80';
var _justgage$tachyons_elm$Tachyons_Classes$hover_white_70 = 'hover-white-70';
var _justgage$tachyons_elm$Tachyons_Classes$hover_white_60 = 'hover-white-60';
var _justgage$tachyons_elm$Tachyons_Classes$hover_white_50 = 'hover-white-50';
var _justgage$tachyons_elm$Tachyons_Classes$hover_white_40 = 'hover-white-40';
var _justgage$tachyons_elm$Tachyons_Classes$hover_white_30 = 'hover-white-30';
var _justgage$tachyons_elm$Tachyons_Classes$hover_white_20 = 'hover-white-20';
var _justgage$tachyons_elm$Tachyons_Classes$hover_white_10 = 'hover-white-10';
var _justgage$tachyons_elm$Tachyons_Classes$hover_white = 'hover-white';
var _justgage$tachyons_elm$Tachyons_Classes$hover_washed_yellow = 'hover-washed-yellow';
var _justgage$tachyons_elm$Tachyons_Classes$hover_washed_red = 'hover-washed-red';
var _justgage$tachyons_elm$Tachyons_Classes$hover_washed_green = 'hover-washed-green';
var _justgage$tachyons_elm$Tachyons_Classes$hover_washed_blue = 'hover-washed-blue';
var _justgage$tachyons_elm$Tachyons_Classes$hover_silver = 'hover-silver';
var _justgage$tachyons_elm$Tachyons_Classes$hover_red = 'hover-red';
var _justgage$tachyons_elm$Tachyons_Classes$hover_purple = 'hover-purple';
var _justgage$tachyons_elm$Tachyons_Classes$hover_pink = 'hover-pink';
var _justgage$tachyons_elm$Tachyons_Classes$hover_orange = 'hover-orange';
var _justgage$tachyons_elm$Tachyons_Classes$hover_near_white = 'hover-near-white';
var _justgage$tachyons_elm$Tachyons_Classes$hover_near_black = 'hover-near-black';
var _justgage$tachyons_elm$Tachyons_Classes$hover_navy = 'hover-navy';
var _justgage$tachyons_elm$Tachyons_Classes$hover_moon_gray = 'hover-moon-gray';
var _justgage$tachyons_elm$Tachyons_Classes$hover_mid_gray = 'hover-mid-gray';
var _justgage$tachyons_elm$Tachyons_Classes$hover_lightest_blue = 'hover-lightest-blue';
var _justgage$tachyons_elm$Tachyons_Classes$hover_light_yellow = 'hover-light-yellow';
var _justgage$tachyons_elm$Tachyons_Classes$hover_light_silver = 'hover-light-silver';
var _justgage$tachyons_elm$Tachyons_Classes$hover_light_red = 'hover-light-red';
var _justgage$tachyons_elm$Tachyons_Classes$hover_light_purple = 'hover-light-purple';
var _justgage$tachyons_elm$Tachyons_Classes$hover_light_pink = 'hover-light-pink';
var _justgage$tachyons_elm$Tachyons_Classes$hover_light_green = 'hover-light-green';
var _justgage$tachyons_elm$Tachyons_Classes$hover_light_gray = 'hover-light-gray';
var _justgage$tachyons_elm$Tachyons_Classes$hover_light_blue = 'hover-light-blue';
var _justgage$tachyons_elm$Tachyons_Classes$hover_inherit = 'hover-inherit';
var _justgage$tachyons_elm$Tachyons_Classes$hover_hot_pink = 'hover-hot-pink';
var _justgage$tachyons_elm$Tachyons_Classes$hover_green = 'hover-green';
var _justgage$tachyons_elm$Tachyons_Classes$hover_gray = 'hover-gray';
var _justgage$tachyons_elm$Tachyons_Classes$hover_gold = 'hover-gold';
var _justgage$tachyons_elm$Tachyons_Classes$hover_dark_red = 'hover-dark-red';
var _justgage$tachyons_elm$Tachyons_Classes$hover_dark_pink = 'hover-dark-pink';
var _justgage$tachyons_elm$Tachyons_Classes$hover_dark_green = 'hover-dark-green';
var _justgage$tachyons_elm$Tachyons_Classes$hover_dark_gray = 'hover-dark-gray';
var _justgage$tachyons_elm$Tachyons_Classes$hover_dark_blue = 'hover-dark-blue';
var _justgage$tachyons_elm$Tachyons_Classes$hover_blue = 'hover-blue';
var _justgage$tachyons_elm$Tachyons_Classes$hover_black_90 = 'hover-black-90';
var _justgage$tachyons_elm$Tachyons_Classes$hover_black_80 = 'hover-black-80';
var _justgage$tachyons_elm$Tachyons_Classes$hover_black_70 = 'hover-black-70';
var _justgage$tachyons_elm$Tachyons_Classes$hover_black_60 = 'hover-black-60';
var _justgage$tachyons_elm$Tachyons_Classes$hover_black_50 = 'hover-black-50';
var _justgage$tachyons_elm$Tachyons_Classes$hover_black_40 = 'hover-black-40';
var _justgage$tachyons_elm$Tachyons_Classes$hover_black_30 = 'hover-black-30';
var _justgage$tachyons_elm$Tachyons_Classes$hover_black_20 = 'hover-black-20';
var _justgage$tachyons_elm$Tachyons_Classes$hover_black_10 = 'hover-black-10';
var _justgage$tachyons_elm$Tachyons_Classes$hover_black = 'hover-black';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_yellow = 'hover-bg-yellow';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_white_90 = 'hover-bg-white-90';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_white_80 = 'hover-bg-white-80';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_white_70 = 'hover-bg-white-70';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_white_60 = 'hover-bg-white-60';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_white_50 = 'hover-bg-white-50';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_white_40 = 'hover-bg-white-40';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_white_30 = 'hover-bg-white-30';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_white_20 = 'hover-bg-white-20';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_white_10 = 'hover-bg-white-10';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_white = 'hover-bg-white';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_washed_yellow = 'hover-bg-washed-yellow';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_washed_red = 'hover-bg-washed-red';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_washed_green = 'hover-bg-washed-green';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_washed_blue = 'hover-bg-washed-blue';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_transparent = 'hover-bg-transparent';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_silver = 'hover-bg-silver';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_red = 'hover-bg-red';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_purple = 'hover-bg-purple';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_pink = 'hover-bg-pink';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_orange = 'hover-bg-orange';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_near_white = 'hover-bg-near-white';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_near_black = 'hover-bg-near-black';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_navy = 'hover-bg-navy';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_moon_gray = 'hover-bg-moon-gray';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_mid_gray = 'hover-bg-mid-gray';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_lightest_blue = 'hover-bg-lightest-blue';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_light_yellow = 'hover-bg-light-yellow';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_light_silver = 'hover-bg-light-silver';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_light_red = 'hover-bg-light-red';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_light_purple = 'hover-bg-light-purple';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_light_pink = 'hover-bg-light-pink';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_light_green = 'hover-bg-light-green';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_light_gray = 'hover-bg-light-gray';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_light_blue = 'hover-bg-light-blue';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_inherit = 'hover-bg-inherit';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_hot_pink = 'hover-bg-hot-pink';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_green = 'hover-bg-green';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_gray = 'hover-bg-gray';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_gold = 'hover-bg-gold';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_dark_red = 'hover-bg-dark-red';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_dark_pink = 'hover-bg-dark-pink';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_dark_green = 'hover-bg-dark-green';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_dark_gray = 'hover-bg-dark-gray';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_dark_blue = 'hover-bg-dark-blue';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_blue = 'hover-bg-blue';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_black_90 = 'hover-bg-black-90';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_black_80 = 'hover-bg-black-80';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_black_70 = 'hover-bg-black-70';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_black_60 = 'hover-bg-black-60';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_black_50 = 'hover-bg-black-50';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_black_40 = 'hover-bg-black-40';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_black_30 = 'hover-bg-black-30';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_black_20 = 'hover-bg-black-20';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_black_10 = 'hover-bg-black-10';
var _justgage$tachyons_elm$Tachyons_Classes$hover_bg_black = 'hover-bg-black';
var _justgage$tachyons_elm$Tachyons_Classes$hot_pink = 'hot-pink';
var _justgage$tachyons_elm$Tachyons_Classes$hide_child = 'hide-child';
var _justgage$tachyons_elm$Tachyons_Classes$helvetica = 'helvetica';
var _justgage$tachyons_elm$Tachyons_Classes$h5_ns = 'h5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$h5_m = 'h5-m';
var _justgage$tachyons_elm$Tachyons_Classes$h5_l = 'h5-l';
var _justgage$tachyons_elm$Tachyons_Classes$h5 = 'h5';
var _justgage$tachyons_elm$Tachyons_Classes$h4_ns = 'h4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$h4_m = 'h4-m';
var _justgage$tachyons_elm$Tachyons_Classes$h4_l = 'h4-l';
var _justgage$tachyons_elm$Tachyons_Classes$h4 = 'h4';
var _justgage$tachyons_elm$Tachyons_Classes$h3_ns = 'h3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$h3_m = 'h3-m';
var _justgage$tachyons_elm$Tachyons_Classes$h3_l = 'h3-l';
var _justgage$tachyons_elm$Tachyons_Classes$h3 = 'h3';
var _justgage$tachyons_elm$Tachyons_Classes$h2_ns = 'h2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$h2_m = 'h2-m';
var _justgage$tachyons_elm$Tachyons_Classes$h2_l = 'h2-l';
var _justgage$tachyons_elm$Tachyons_Classes$h2 = 'h2';
var _justgage$tachyons_elm$Tachyons_Classes$h1_ns = 'h1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$h1_m = 'h1-m';
var _justgage$tachyons_elm$Tachyons_Classes$h1_l = 'h1-l';
var _justgage$tachyons_elm$Tachyons_Classes$h1 = 'h1';
var _justgage$tachyons_elm$Tachyons_Classes$h_inherit_ns = 'h-inherit-ns';
var _justgage$tachyons_elm$Tachyons_Classes$h_inherit_m = 'h-inherit-m';
var _justgage$tachyons_elm$Tachyons_Classes$h_inherit_l = 'h-inherit-l';
var _justgage$tachyons_elm$Tachyons_Classes$h_inherit = 'h-inherit';
var _justgage$tachyons_elm$Tachyons_Classes$h_auto_ns = 'h-auto-ns';
var _justgage$tachyons_elm$Tachyons_Classes$h_auto_m = 'h-auto-m';
var _justgage$tachyons_elm$Tachyons_Classes$h_auto_l = 'h-auto-l';
var _justgage$tachyons_elm$Tachyons_Classes$h_auto = 'h-auto';
var _justgage$tachyons_elm$Tachyons_Classes$h_75_ns = 'h-75-ns';
var _justgage$tachyons_elm$Tachyons_Classes$h_75_m = 'h-75-m';
var _justgage$tachyons_elm$Tachyons_Classes$h_75_l = 'h-75-l';
var _justgage$tachyons_elm$Tachyons_Classes$h_75 = 'h-75';
var _justgage$tachyons_elm$Tachyons_Classes$h_50_ns = 'h-50-ns';
var _justgage$tachyons_elm$Tachyons_Classes$h_50_m = 'h-50-m';
var _justgage$tachyons_elm$Tachyons_Classes$h_50_l = 'h-50-l';
var _justgage$tachyons_elm$Tachyons_Classes$h_50 = 'h-50';
var _justgage$tachyons_elm$Tachyons_Classes$h_25_ns = 'h-25-ns';
var _justgage$tachyons_elm$Tachyons_Classes$h_25_m = 'h-25-m';
var _justgage$tachyons_elm$Tachyons_Classes$h_25_l = 'h-25-l';
var _justgage$tachyons_elm$Tachyons_Classes$h_25 = 'h-25';
var _justgage$tachyons_elm$Tachyons_Classes$h_100_ns = 'h-100-ns';
var _justgage$tachyons_elm$Tachyons_Classes$h_100_m = 'h-100-m';
var _justgage$tachyons_elm$Tachyons_Classes$h_100_l = 'h-100-l';
var _justgage$tachyons_elm$Tachyons_Classes$h_100 = 'h-100';
var _justgage$tachyons_elm$Tachyons_Classes$grow_large = 'grow-large';
var _justgage$tachyons_elm$Tachyons_Classes$grow = 'grow';
var _justgage$tachyons_elm$Tachyons_Classes$green = 'green';
var _justgage$tachyons_elm$Tachyons_Classes$gray = 'gray';
var _justgage$tachyons_elm$Tachyons_Classes$gold = 'gold';
var _justgage$tachyons_elm$Tachyons_Classes$glow = 'glow';
var _justgage$tachyons_elm$Tachyons_Classes$georgia = 'georgia';
var _justgage$tachyons_elm$Tachyons_Classes$garamond = 'garamond';
var _justgage$tachyons_elm$Tachyons_Classes$fw9_ns = 'fw9-ns';
var _justgage$tachyons_elm$Tachyons_Classes$fw9_m = 'fw9-m';
var _justgage$tachyons_elm$Tachyons_Classes$fw9_l = 'fw9-l';
var _justgage$tachyons_elm$Tachyons_Classes$fw9 = 'fw9';
var _justgage$tachyons_elm$Tachyons_Classes$fw8_ns = 'fw8-ns';
var _justgage$tachyons_elm$Tachyons_Classes$fw8_m = 'fw8-m';
var _justgage$tachyons_elm$Tachyons_Classes$fw8_l = 'fw8-l';
var _justgage$tachyons_elm$Tachyons_Classes$fw8 = 'fw8';
var _justgage$tachyons_elm$Tachyons_Classes$fw7_ns = 'fw7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$fw7_m = 'fw7-m';
var _justgage$tachyons_elm$Tachyons_Classes$fw7_l = 'fw7-l';
var _justgage$tachyons_elm$Tachyons_Classes$fw7 = 'fw7';
var _justgage$tachyons_elm$Tachyons_Classes$fw6_ns = 'fw6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$fw6_m = 'fw6-m';
var _justgage$tachyons_elm$Tachyons_Classes$fw6_l = 'fw6-l';
var _justgage$tachyons_elm$Tachyons_Classes$fw6 = 'fw6';
var _justgage$tachyons_elm$Tachyons_Classes$fw5_ns = 'fw5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$fw5_m = 'fw5-m';
var _justgage$tachyons_elm$Tachyons_Classes$fw5_l = 'fw5-l';
var _justgage$tachyons_elm$Tachyons_Classes$fw5 = 'fw5';
var _justgage$tachyons_elm$Tachyons_Classes$fw4_ns = 'fw4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$fw4_m = 'fw4-m';
var _justgage$tachyons_elm$Tachyons_Classes$fw4_l = 'fw4-l';
var _justgage$tachyons_elm$Tachyons_Classes$fw4 = 'fw4';
var _justgage$tachyons_elm$Tachyons_Classes$fw3_ns = 'fw3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$fw3_m = 'fw3-m';
var _justgage$tachyons_elm$Tachyons_Classes$fw3_l = 'fw3-l';
var _justgage$tachyons_elm$Tachyons_Classes$fw3 = 'fw3';
var _justgage$tachyons_elm$Tachyons_Classes$fw2_ns = 'fw2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$fw2_m = 'fw2-m';
var _justgage$tachyons_elm$Tachyons_Classes$fw2_l = 'fw2-l';
var _justgage$tachyons_elm$Tachyons_Classes$fw2 = 'fw2';
var _justgage$tachyons_elm$Tachyons_Classes$fw1_ns = 'fw1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$fw1_m = 'fw1-m';
var _justgage$tachyons_elm$Tachyons_Classes$fw1_l = 'fw1-l';
var _justgage$tachyons_elm$Tachyons_Classes$fw1 = 'fw1';
var _justgage$tachyons_elm$Tachyons_Classes$fs_normal_ns = 'fs-normal-ns';
var _justgage$tachyons_elm$Tachyons_Classes$fs_normal_m = 'fs-normal-m';
var _justgage$tachyons_elm$Tachyons_Classes$fs_normal_l = 'fs-normal-l';
var _justgage$tachyons_elm$Tachyons_Classes$fs_normal = 'fs-normal';
var _justgage$tachyons_elm$Tachyons_Classes$fr_ns = 'fr-ns';
var _justgage$tachyons_elm$Tachyons_Classes$fr_m = 'fr-m';
var _justgage$tachyons_elm$Tachyons_Classes$fr_l = 'fr-l';
var _justgage$tachyons_elm$Tachyons_Classes$fr = 'fr';
var _justgage$tachyons_elm$Tachyons_Classes$fn_ns = 'fn-ns';
var _justgage$tachyons_elm$Tachyons_Classes$fn_m = 'fn-m';
var _justgage$tachyons_elm$Tachyons_Classes$fn_l = 'fn-l';
var _justgage$tachyons_elm$Tachyons_Classes$fn = 'fn';
var _justgage$tachyons_elm$Tachyons_Classes$flex_wrap_reverse_ns = 'flex-wrap-reverse-ns';
var _justgage$tachyons_elm$Tachyons_Classes$flex_wrap_reverse_m = 'flex-wrap-reverse-m';
var _justgage$tachyons_elm$Tachyons_Classes$flex_wrap_reverse_l = 'flex-wrap-reverse-l';
var _justgage$tachyons_elm$Tachyons_Classes$flex_wrap_reverse = 'flex-wrap-reverse';
var _justgage$tachyons_elm$Tachyons_Classes$flex_wrap_ns = 'flex-wrap-ns';
var _justgage$tachyons_elm$Tachyons_Classes$flex_wrap_m = 'flex-wrap-m';
var _justgage$tachyons_elm$Tachyons_Classes$flex_wrap_l = 'flex-wrap-l';
var _justgage$tachyons_elm$Tachyons_Classes$flex_wrap = 'flex-wrap';
var _justgage$tachyons_elm$Tachyons_Classes$flex_row_reverse_ns = 'flex-row-reverse-ns';
var _justgage$tachyons_elm$Tachyons_Classes$flex_row_reverse_m = 'flex-row-reverse-m';
var _justgage$tachyons_elm$Tachyons_Classes$flex_row_reverse_l = 'flex-row-reverse-l';
var _justgage$tachyons_elm$Tachyons_Classes$flex_row_reverse = 'flex-row-reverse';
var _justgage$tachyons_elm$Tachyons_Classes$flex_row_ns = 'flex-row-ns';
var _justgage$tachyons_elm$Tachyons_Classes$flex_row_m = 'flex-row-m';
var _justgage$tachyons_elm$Tachyons_Classes$flex_row_l = 'flex-row-l';
var _justgage$tachyons_elm$Tachyons_Classes$flex_row = 'flex-row';
var _justgage$tachyons_elm$Tachyons_Classes$flex_ns = 'flex-ns';
var _justgage$tachyons_elm$Tachyons_Classes$flex_none_ns = 'flex-none-ns';
var _justgage$tachyons_elm$Tachyons_Classes$flex_none_m = 'flex-none-m';
var _justgage$tachyons_elm$Tachyons_Classes$flex_none_l = 'flex-none-l';
var _justgage$tachyons_elm$Tachyons_Classes$flex_none = 'flex-none';
var _justgage$tachyons_elm$Tachyons_Classes$flex_m = 'flex-m';
var _justgage$tachyons_elm$Tachyons_Classes$flex_l = 'flex-l';
var _justgage$tachyons_elm$Tachyons_Classes$flex_column_reverse_ns = 'flex-column-reverse-ns';
var _justgage$tachyons_elm$Tachyons_Classes$flex_column_reverse_m = 'flex-column-reverse-m';
var _justgage$tachyons_elm$Tachyons_Classes$flex_column_reverse_l = 'flex-column-reverse-l';
var _justgage$tachyons_elm$Tachyons_Classes$flex_column_reverse = 'flex-column-reverse';
var _justgage$tachyons_elm$Tachyons_Classes$flex_column_ns = 'flex-column-ns';
var _justgage$tachyons_elm$Tachyons_Classes$flex_column_m = 'flex-column-m';
var _justgage$tachyons_elm$Tachyons_Classes$flex_column_l = 'flex-column-l';
var _justgage$tachyons_elm$Tachyons_Classes$flex_column = 'flex-column';
var _justgage$tachyons_elm$Tachyons_Classes$flex_auto_ns = 'flex-auto-ns';
var _justgage$tachyons_elm$Tachyons_Classes$flex_auto_m = 'flex-auto-m';
var _justgage$tachyons_elm$Tachyons_Classes$flex_auto_l = 'flex-auto-l';
var _justgage$tachyons_elm$Tachyons_Classes$flex_auto = 'flex-auto';
var _justgage$tachyons_elm$Tachyons_Classes$flex = 'flex';
var _justgage$tachyons_elm$Tachyons_Classes$fl_ns = 'fl-ns';
var _justgage$tachyons_elm$Tachyons_Classes$fl_m = 'fl-m';
var _justgage$tachyons_elm$Tachyons_Classes$fl_l = 'fl-l';
var _justgage$tachyons_elm$Tachyons_Classes$fl = 'fl';
var _justgage$tachyons_elm$Tachyons_Classes$fixed_ns = 'fixed-ns';
var _justgage$tachyons_elm$Tachyons_Classes$fixed_m = 'fixed-m';
var _justgage$tachyons_elm$Tachyons_Classes$fixed_l = 'fixed-l';
var _justgage$tachyons_elm$Tachyons_Classes$fixed = 'fixed';
var _justgage$tachyons_elm$Tachyons_Classes$f7_ns = 'f7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$f7_m = 'f7-m';
var _justgage$tachyons_elm$Tachyons_Classes$f7_l = 'f7-l';
var _justgage$tachyons_elm$Tachyons_Classes$f7 = 'f7';
var _justgage$tachyons_elm$Tachyons_Classes$f6_ns = 'f6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$f6_m = 'f6-m';
var _justgage$tachyons_elm$Tachyons_Classes$f6_l = 'f6-l';
var _justgage$tachyons_elm$Tachyons_Classes$f6 = 'f6';
var _justgage$tachyons_elm$Tachyons_Classes$f5_ns = 'f5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$f5_m = 'f5-m';
var _justgage$tachyons_elm$Tachyons_Classes$f5_l = 'f5-l';
var _justgage$tachyons_elm$Tachyons_Classes$f5 = 'f5';
var _justgage$tachyons_elm$Tachyons_Classes$f4_ns = 'f4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$f4_m = 'f4-m';
var _justgage$tachyons_elm$Tachyons_Classes$f4_l = 'f4-l';
var _justgage$tachyons_elm$Tachyons_Classes$f4 = 'f4';
var _justgage$tachyons_elm$Tachyons_Classes$f3_ns = 'f3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$f3_m = 'f3-m';
var _justgage$tachyons_elm$Tachyons_Classes$f3_l = 'f3-l';
var _justgage$tachyons_elm$Tachyons_Classes$f3 = 'f3';
var _justgage$tachyons_elm$Tachyons_Classes$f2_ns = 'f2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$f2_m = 'f2-m';
var _justgage$tachyons_elm$Tachyons_Classes$f2_l = 'f2-l';
var _justgage$tachyons_elm$Tachyons_Classes$f2 = 'f2';
var _justgage$tachyons_elm$Tachyons_Classes$f1_ns = 'f1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$f1_m = 'f1-m';
var _justgage$tachyons_elm$Tachyons_Classes$f1_l = 'f1-l';
var _justgage$tachyons_elm$Tachyons_Classes$f1 = 'f1';
var _justgage$tachyons_elm$Tachyons_Classes$f_subheadline_ns = 'f-subheadline-ns';
var _justgage$tachyons_elm$Tachyons_Classes$f_subheadline_m = 'f-subheadline-m';
var _justgage$tachyons_elm$Tachyons_Classes$f_subheadline_l = 'f-subheadline-l';
var _justgage$tachyons_elm$Tachyons_Classes$f_subheadline = 'f-subheadline';
var _justgage$tachyons_elm$Tachyons_Classes$f_headline_ns = 'f-headline-ns';
var _justgage$tachyons_elm$Tachyons_Classes$f_headline_m = 'f-headline-m';
var _justgage$tachyons_elm$Tachyons_Classes$f_headline_l = 'f-headline-l';
var _justgage$tachyons_elm$Tachyons_Classes$f_headline = 'f-headline';
var _justgage$tachyons_elm$Tachyons_Classes$f_6_ns = 'f-6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$f_6_m = 'f-6-m';
var _justgage$tachyons_elm$Tachyons_Classes$f_6_l = 'f-6-l';
var _justgage$tachyons_elm$Tachyons_Classes$f_6 = 'f-6';
var _justgage$tachyons_elm$Tachyons_Classes$f_5_ns = 'f-5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$f_5_m = 'f-5-m';
var _justgage$tachyons_elm$Tachyons_Classes$f_5_l = 'f-5-l';
var _justgage$tachyons_elm$Tachyons_Classes$f_5 = 'f-5';
var _justgage$tachyons_elm$Tachyons_Classes$dtc_ns = 'dtc-ns';
var _justgage$tachyons_elm$Tachyons_Classes$dtc_m = 'dtc-m';
var _justgage$tachyons_elm$Tachyons_Classes$dtc_l = 'dtc-l';
var _justgage$tachyons_elm$Tachyons_Classes$dtc = 'dtc';
var _justgage$tachyons_elm$Tachyons_Classes$dt_row_ns = 'dt-row-ns';
var _justgage$tachyons_elm$Tachyons_Classes$dt_row_m = 'dt-row-m';
var _justgage$tachyons_elm$Tachyons_Classes$dt_row_l = 'dt-row-l';
var _justgage$tachyons_elm$Tachyons_Classes$dt_row_group_ns = 'dt-row-group-ns';
var _justgage$tachyons_elm$Tachyons_Classes$dt_row_group_m = 'dt-row-group-m';
var _justgage$tachyons_elm$Tachyons_Classes$dt_row_group_l = 'dt-row-group-l';
var _justgage$tachyons_elm$Tachyons_Classes$dt_row_group = 'dt-row-group';
var _justgage$tachyons_elm$Tachyons_Classes$dt_row = 'dt-row';
var _justgage$tachyons_elm$Tachyons_Classes$dt_ns = 'dt-ns';
var _justgage$tachyons_elm$Tachyons_Classes$dt_m = 'dt-m';
var _justgage$tachyons_elm$Tachyons_Classes$dt_l = 'dt-l';
var _justgage$tachyons_elm$Tachyons_Classes$dt_column_ns = 'dt-column-ns';
var _justgage$tachyons_elm$Tachyons_Classes$dt_column_m = 'dt-column-m';
var _justgage$tachyons_elm$Tachyons_Classes$dt_column_l = 'dt-column-l';
var _justgage$tachyons_elm$Tachyons_Classes$dt_column_group_ns = 'dt-column-group-ns';
var _justgage$tachyons_elm$Tachyons_Classes$dt_column_group_m = 'dt-column-group-m';
var _justgage$tachyons_elm$Tachyons_Classes$dt_column_group_l = 'dt-column-group-l';
var _justgage$tachyons_elm$Tachyons_Classes$dt_column_group = 'dt-column-group';
var _justgage$tachyons_elm$Tachyons_Classes$dt_column = 'dt-column';
var _justgage$tachyons_elm$Tachyons_Classes$dt__fixed_ns = 'dt--fixed-ns';
var _justgage$tachyons_elm$Tachyons_Classes$dt__fixed_m = 'dt--fixed-m';
var _justgage$tachyons_elm$Tachyons_Classes$dt__fixed_l = 'dt--fixed-l';
var _justgage$tachyons_elm$Tachyons_Classes$dt__fixed = 'dt--fixed';
var _justgage$tachyons_elm$Tachyons_Classes$dt = 'dt';
var _justgage$tachyons_elm$Tachyons_Classes$dn_ns = 'dn-ns';
var _justgage$tachyons_elm$Tachyons_Classes$dn_m = 'dn-m';
var _justgage$tachyons_elm$Tachyons_Classes$dn_l = 'dn-l';
var _justgage$tachyons_elm$Tachyons_Classes$dn = 'dn';
var _justgage$tachyons_elm$Tachyons_Classes$dit_ns = 'dit-ns';
var _justgage$tachyons_elm$Tachyons_Classes$dit_m = 'dit-m';
var _justgage$tachyons_elm$Tachyons_Classes$dit_l = 'dit-l';
var _justgage$tachyons_elm$Tachyons_Classes$dit = 'dit';
var _justgage$tachyons_elm$Tachyons_Classes$dim = 'dim';
var _justgage$tachyons_elm$Tachyons_Classes$dib_ns = 'dib-ns';
var _justgage$tachyons_elm$Tachyons_Classes$dib_m = 'dib-m';
var _justgage$tachyons_elm$Tachyons_Classes$dib_l = 'dib-l';
var _justgage$tachyons_elm$Tachyons_Classes$dib = 'dib';
var _justgage$tachyons_elm$Tachyons_Classes$di_ns = 'di-ns';
var _justgage$tachyons_elm$Tachyons_Classes$di_m = 'di-m';
var _justgage$tachyons_elm$Tachyons_Classes$di_l = 'di-l';
var _justgage$tachyons_elm$Tachyons_Classes$di = 'di';
var _justgage$tachyons_elm$Tachyons_Classes$debug_white = 'debug-white';
var _justgage$tachyons_elm$Tachyons_Classes$debug_grid_8_solid = 'debug-grid-8-solid';
var _justgage$tachyons_elm$Tachyons_Classes$debug_grid_16_solid = 'debug-grid-16-solid';
var _justgage$tachyons_elm$Tachyons_Classes$debug_grid_16 = 'debug-grid-16';
var _justgage$tachyons_elm$Tachyons_Classes$debug_grid = 'debug-grid';
var _justgage$tachyons_elm$Tachyons_Classes$debug_black = 'debug-black';
var _justgage$tachyons_elm$Tachyons_Classes$debug = 'debug';
var _justgage$tachyons_elm$Tachyons_Classes$db_ns = 'db-ns';
var _justgage$tachyons_elm$Tachyons_Classes$db_m = 'db-m';
var _justgage$tachyons_elm$Tachyons_Classes$db_l = 'db-l';
var _justgage$tachyons_elm$Tachyons_Classes$db = 'db';
var _justgage$tachyons_elm$Tachyons_Classes$dark_red = 'dark-red';
var _justgage$tachyons_elm$Tachyons_Classes$dark_pink = 'dark-pink';
var _justgage$tachyons_elm$Tachyons_Classes$dark_green = 'dark-green';
var _justgage$tachyons_elm$Tachyons_Classes$dark_gray = 'dark-gray';
var _justgage$tachyons_elm$Tachyons_Classes$dark_blue = 'dark-blue';
var _justgage$tachyons_elm$Tachyons_Classes$cr_ns = 'cr-ns';
var _justgage$tachyons_elm$Tachyons_Classes$cr_m = 'cr-m';
var _justgage$tachyons_elm$Tachyons_Classes$cr_l = 'cr-l';
var _justgage$tachyons_elm$Tachyons_Classes$cr = 'cr';
var _justgage$tachyons_elm$Tachyons_Classes$cover_ns = 'cover-ns';
var _justgage$tachyons_elm$Tachyons_Classes$cover_m = 'cover-m';
var _justgage$tachyons_elm$Tachyons_Classes$cover_l = 'cover-l';
var _justgage$tachyons_elm$Tachyons_Classes$cover = 'cover';
var _justgage$tachyons_elm$Tachyons_Classes$courier = 'courier';
var _justgage$tachyons_elm$Tachyons_Classes$content_stretch_ns = 'content-stretch-ns';
var _justgage$tachyons_elm$Tachyons_Classes$content_stretch_m = 'content-stretch-m';
var _justgage$tachyons_elm$Tachyons_Classes$content_stretch_l = 'content-stretch-l';
var _justgage$tachyons_elm$Tachyons_Classes$content_stretch = 'content-stretch';
var _justgage$tachyons_elm$Tachyons_Classes$content_start_ns = 'content-start-ns';
var _justgage$tachyons_elm$Tachyons_Classes$content_start_m = 'content-start-m';
var _justgage$tachyons_elm$Tachyons_Classes$content_start_l = 'content-start-l';
var _justgage$tachyons_elm$Tachyons_Classes$content_start = 'content-start';
var _justgage$tachyons_elm$Tachyons_Classes$content_end_ns = 'content-end-ns';
var _justgage$tachyons_elm$Tachyons_Classes$content_end_m = 'content-end-m';
var _justgage$tachyons_elm$Tachyons_Classes$content_end_l = 'content-end-l';
var _justgage$tachyons_elm$Tachyons_Classes$content_end = 'content-end';
var _justgage$tachyons_elm$Tachyons_Classes$content_center_ns = 'content-center-ns';
var _justgage$tachyons_elm$Tachyons_Classes$content_center_m = 'content-center-m';
var _justgage$tachyons_elm$Tachyons_Classes$content_center_l = 'content-center-l';
var _justgage$tachyons_elm$Tachyons_Classes$content_center = 'content-center';
var _justgage$tachyons_elm$Tachyons_Classes$content_between_ns = 'content-between-ns';
var _justgage$tachyons_elm$Tachyons_Classes$content_between_m = 'content-between-m';
var _justgage$tachyons_elm$Tachyons_Classes$content_between_l = 'content-between-l';
var _justgage$tachyons_elm$Tachyons_Classes$content_between = 'content-between';
var _justgage$tachyons_elm$Tachyons_Classes$content_around_ns = 'content-around-ns';
var _justgage$tachyons_elm$Tachyons_Classes$content_around_m = 'content-around-m';
var _justgage$tachyons_elm$Tachyons_Classes$content_around_l = 'content-around-l';
var _justgage$tachyons_elm$Tachyons_Classes$content_around = 'content-around';
var _justgage$tachyons_elm$Tachyons_Classes$contain_ns = 'contain-ns';
var _justgage$tachyons_elm$Tachyons_Classes$contain_m = 'contain-m';
var _justgage$tachyons_elm$Tachyons_Classes$contain_l = 'contain-l';
var _justgage$tachyons_elm$Tachyons_Classes$contain = 'contain';
var _justgage$tachyons_elm$Tachyons_Classes$color_inherit = 'color-inherit';
var _justgage$tachyons_elm$Tachyons_Classes$code = 'code';
var _justgage$tachyons_elm$Tachyons_Classes$collapse = 'collapse';
var _justgage$tachyons_elm$Tachyons_Classes$cn_ns = 'cn-ns';
var _justgage$tachyons_elm$Tachyons_Classes$cn_m = 'cn-m';
var _justgage$tachyons_elm$Tachyons_Classes$cn_l = 'cn-l';
var _justgage$tachyons_elm$Tachyons_Classes$cn = 'cn';
var _justgage$tachyons_elm$Tachyons_Classes$clip_ns = 'clip-ns';
var _justgage$tachyons_elm$Tachyons_Classes$clip_m = 'clip-m';
var _justgage$tachyons_elm$Tachyons_Classes$clip_l = 'clip-l';
var _justgage$tachyons_elm$Tachyons_Classes$clip = 'clip';
var _justgage$tachyons_elm$Tachyons_Classes$cl_ns = 'cl-ns';
var _justgage$tachyons_elm$Tachyons_Classes$cl_m = 'cl-m';
var _justgage$tachyons_elm$Tachyons_Classes$cl_l = 'cl-l';
var _justgage$tachyons_elm$Tachyons_Classes$cl = 'cl';
var _justgage$tachyons_elm$Tachyons_Classes$child = 'child';
var _justgage$tachyons_elm$Tachyons_Classes$cf = 'cf';
var _justgage$tachyons_elm$Tachyons_Classes$center_ns = 'center-ns';
var _justgage$tachyons_elm$Tachyons_Classes$center_m = 'center-m';
var _justgage$tachyons_elm$Tachyons_Classes$center_l = 'center-l';
var _justgage$tachyons_elm$Tachyons_Classes$center = 'center';
var _justgage$tachyons_elm$Tachyons_Classes$cb_ns = 'cb-ns';
var _justgage$tachyons_elm$Tachyons_Classes$cb_m = 'cb-m';
var _justgage$tachyons_elm$Tachyons_Classes$cb_l = 'cb-l';
var _justgage$tachyons_elm$Tachyons_Classes$cb = 'cb';
var _justgage$tachyons_elm$Tachyons_Classes$calisto = 'calisto';
var _justgage$tachyons_elm$Tachyons_Classes$bw5_ns = 'bw5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bw5_m = 'bw5-m';
var _justgage$tachyons_elm$Tachyons_Classes$bw5_l = 'bw5-l';
var _justgage$tachyons_elm$Tachyons_Classes$bw5 = 'bw5';
var _justgage$tachyons_elm$Tachyons_Classes$bw4_ns = 'bw4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bw4_m = 'bw4-m';
var _justgage$tachyons_elm$Tachyons_Classes$bw4_l = 'bw4-l';
var _justgage$tachyons_elm$Tachyons_Classes$bw4 = 'bw4';
var _justgage$tachyons_elm$Tachyons_Classes$bw3_ns = 'bw3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bw3_m = 'bw3-m';
var _justgage$tachyons_elm$Tachyons_Classes$bw3_l = 'bw3-l';
var _justgage$tachyons_elm$Tachyons_Classes$bw3 = 'bw3';
var _justgage$tachyons_elm$Tachyons_Classes$bw2_ns = 'bw2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bw2_m = 'bw2-m';
var _justgage$tachyons_elm$Tachyons_Classes$bw2_l = 'bw2-l';
var _justgage$tachyons_elm$Tachyons_Classes$bw2 = 'bw2';
var _justgage$tachyons_elm$Tachyons_Classes$bw1_ns = 'bw1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bw1_m = 'bw1-m';
var _justgage$tachyons_elm$Tachyons_Classes$bw1_l = 'bw1-l';
var _justgage$tachyons_elm$Tachyons_Classes$bw1 = 'bw1';
var _justgage$tachyons_elm$Tachyons_Classes$bw0_ns = 'bw0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bw0_m = 'bw0-m';
var _justgage$tachyons_elm$Tachyons_Classes$bw0_l = 'bw0-l';
var _justgage$tachyons_elm$Tachyons_Classes$bw0 = 'bw0';
var _justgage$tachyons_elm$Tachyons_Classes$button_reset = 'button-reset';
var _justgage$tachyons_elm$Tachyons_Classes$bt_ns = 'bt-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bt_m = 'bt-m';
var _justgage$tachyons_elm$Tachyons_Classes$bt_l = 'bt-l';
var _justgage$tachyons_elm$Tachyons_Classes$bt_0_ns = 'bt-0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bt_0_m = 'bt-0-m';
var _justgage$tachyons_elm$Tachyons_Classes$bt_0_l = 'bt-0-l';
var _justgage$tachyons_elm$Tachyons_Classes$bt_0 = 'bt-0';
var _justgage$tachyons_elm$Tachyons_Classes$bt = 'bt';
var _justgage$tachyons_elm$Tachyons_Classes$br4_ns = 'br4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$br4_m = 'br4-m';
var _justgage$tachyons_elm$Tachyons_Classes$br4_l = 'br4-l';
var _justgage$tachyons_elm$Tachyons_Classes$br4 = 'br4';
var _justgage$tachyons_elm$Tachyons_Classes$br3_ns = 'br3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$br3_m = 'br3-m';
var _justgage$tachyons_elm$Tachyons_Classes$br3_l = 'br3-l';
var _justgage$tachyons_elm$Tachyons_Classes$br3 = 'br3';
var _justgage$tachyons_elm$Tachyons_Classes$br2_ns = 'br2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$br2_m = 'br2-m';
var _justgage$tachyons_elm$Tachyons_Classes$br2_l = 'br2-l';
var _justgage$tachyons_elm$Tachyons_Classes$br2 = 'br2';
var _justgage$tachyons_elm$Tachyons_Classes$br1_ns = 'br1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$br1_m = 'br1-m';
var _justgage$tachyons_elm$Tachyons_Classes$br1_l = 'br1-l';
var _justgage$tachyons_elm$Tachyons_Classes$br1 = 'br1';
var _justgage$tachyons_elm$Tachyons_Classes$br0_ns = 'br0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$br0_m = 'br0-m';
var _justgage$tachyons_elm$Tachyons_Classes$br0_l = 'br0-l';
var _justgage$tachyons_elm$Tachyons_Classes$br0 = 'br0';
var _justgage$tachyons_elm$Tachyons_Classes$br_pill_ns = 'br-pill-ns';
var _justgage$tachyons_elm$Tachyons_Classes$br_pill_m = 'br-pill-m';
var _justgage$tachyons_elm$Tachyons_Classes$br_pill_l = 'br-pill-l';
var _justgage$tachyons_elm$Tachyons_Classes$br_pill = 'br-pill';
var _justgage$tachyons_elm$Tachyons_Classes$br_ns = 'br-ns';
var _justgage$tachyons_elm$Tachyons_Classes$br_m = 'br-m';
var _justgage$tachyons_elm$Tachyons_Classes$br_l = 'br-l';
var _justgage$tachyons_elm$Tachyons_Classes$br_100_ns = 'br-100-ns';
var _justgage$tachyons_elm$Tachyons_Classes$br_100_m = 'br-100-m';
var _justgage$tachyons_elm$Tachyons_Classes$br_100_l = 'br-100-l';
var _justgage$tachyons_elm$Tachyons_Classes$br_100 = 'br-100';
var _justgage$tachyons_elm$Tachyons_Classes$br_0_ns = 'br-0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$br_0_m = 'br-0-m';
var _justgage$tachyons_elm$Tachyons_Classes$br_0_l = 'br-0-l';
var _justgage$tachyons_elm$Tachyons_Classes$br_0 = 'br-0';
var _justgage$tachyons_elm$Tachyons_Classes$br__top_ns = 'br--top-ns';
var _justgage$tachyons_elm$Tachyons_Classes$br__top_m = 'br--top-m';
var _justgage$tachyons_elm$Tachyons_Classes$br__top_l = 'br--top-l';
var _justgage$tachyons_elm$Tachyons_Classes$br__top = 'br--top';
var _justgage$tachyons_elm$Tachyons_Classes$br__right_ns = 'br--right-ns';
var _justgage$tachyons_elm$Tachyons_Classes$br__right_m = 'br--right-m';
var _justgage$tachyons_elm$Tachyons_Classes$br__right_l = 'br--right-l';
var _justgage$tachyons_elm$Tachyons_Classes$br__right = 'br--right';
var _justgage$tachyons_elm$Tachyons_Classes$br__left_ns = 'br--left-ns';
var _justgage$tachyons_elm$Tachyons_Classes$br__left_m = 'br--left-m';
var _justgage$tachyons_elm$Tachyons_Classes$br__left_l = 'br--left-l';
var _justgage$tachyons_elm$Tachyons_Classes$br__left = 'br--left';
var _justgage$tachyons_elm$Tachyons_Classes$br__bottom_ns = 'br--bottom-ns';
var _justgage$tachyons_elm$Tachyons_Classes$br__bottom_m = 'br--bottom-m';
var _justgage$tachyons_elm$Tachyons_Classes$br__bottom_l = 'br--bottom-l';
var _justgage$tachyons_elm$Tachyons_Classes$br__bottom = 'br--bottom';
var _justgage$tachyons_elm$Tachyons_Classes$br = 'br';
var _justgage$tachyons_elm$Tachyons_Classes$bottom_2_ns = 'bottom-2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bottom_2_m = 'bottom-2-m';
var _justgage$tachyons_elm$Tachyons_Classes$bottom_2_l = 'bottom-2-l';
var _justgage$tachyons_elm$Tachyons_Classes$bottom_2 = 'bottom-2';
var _justgage$tachyons_elm$Tachyons_Classes$bottom_1_ns = 'bottom-1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bottom_1_m = 'bottom-1-m';
var _justgage$tachyons_elm$Tachyons_Classes$bottom_1_l = 'bottom-1-l';
var _justgage$tachyons_elm$Tachyons_Classes$bottom_1 = 'bottom-1';
var _justgage$tachyons_elm$Tachyons_Classes$bottom_0_ns = 'bottom-0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bottom_0_m = 'bottom-0-m';
var _justgage$tachyons_elm$Tachyons_Classes$bottom_0_l = 'bottom-0-l';
var _justgage$tachyons_elm$Tachyons_Classes$bottom_0 = 'bottom-0';
var _justgage$tachyons_elm$Tachyons_Classes$bottom__2_ns = 'bottom--2-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bottom__2_m = 'bottom--2-m';
var _justgage$tachyons_elm$Tachyons_Classes$bottom__2_l = 'bottom--2-l';
var _justgage$tachyons_elm$Tachyons_Classes$bottom__2 = 'bottom--2';
var _justgage$tachyons_elm$Tachyons_Classes$bottom__1_ns = 'bottom--1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bottom__1_m = 'bottom--1-m';
var _justgage$tachyons_elm$Tachyons_Classes$bottom__1_l = 'bottom--1-l';
var _justgage$tachyons_elm$Tachyons_Classes$bottom__1 = 'bottom--1';
var _justgage$tachyons_elm$Tachyons_Classes$bodoni = 'bodoni';
var _justgage$tachyons_elm$Tachyons_Classes$border_box = 'border-box';
var _justgage$tachyons_elm$Tachyons_Classes$bn_ns = 'bn-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bn_m = 'bn-m';
var _justgage$tachyons_elm$Tachyons_Classes$bn_l = 'bn-l';
var _justgage$tachyons_elm$Tachyons_Classes$bn = 'bn';
var _justgage$tachyons_elm$Tachyons_Classes$blue = 'blue';
var _justgage$tachyons_elm$Tachyons_Classes$black_90 = 'black-90';
var _justgage$tachyons_elm$Tachyons_Classes$black_80 = 'black-80';
var _justgage$tachyons_elm$Tachyons_Classes$black_70 = 'black-70';
var _justgage$tachyons_elm$Tachyons_Classes$black_60 = 'black-60';
var _justgage$tachyons_elm$Tachyons_Classes$black_50 = 'black-50';
var _justgage$tachyons_elm$Tachyons_Classes$black_40 = 'black-40';
var _justgage$tachyons_elm$Tachyons_Classes$black_30 = 'black-30';
var _justgage$tachyons_elm$Tachyons_Classes$black_20 = 'black-20';
var _justgage$tachyons_elm$Tachyons_Classes$black_10 = 'black-10';
var _justgage$tachyons_elm$Tachyons_Classes$black_05 = 'black-05';
var _justgage$tachyons_elm$Tachyons_Classes$black = 'black';
var _justgage$tachyons_elm$Tachyons_Classes$bl_ns = 'bl-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bl_m = 'bl-m';
var _justgage$tachyons_elm$Tachyons_Classes$bl_l = 'bl-l';
var _justgage$tachyons_elm$Tachyons_Classes$bl_0_ns = 'bl-0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bl_0_m = 'bl-0-m';
var _justgage$tachyons_elm$Tachyons_Classes$bl_0_l = 'bl-0-l';
var _justgage$tachyons_elm$Tachyons_Classes$bl_0 = 'bl-0';
var _justgage$tachyons_elm$Tachyons_Classes$bl = 'bl';
var _justgage$tachyons_elm$Tachyons_Classes$bg_yellow = 'bg-yellow';
var _justgage$tachyons_elm$Tachyons_Classes$bg_white_90 = 'bg-white-90';
var _justgage$tachyons_elm$Tachyons_Classes$bg_white_80 = 'bg-white-80';
var _justgage$tachyons_elm$Tachyons_Classes$bg_white_70 = 'bg-white-70';
var _justgage$tachyons_elm$Tachyons_Classes$bg_white_60 = 'bg-white-60';
var _justgage$tachyons_elm$Tachyons_Classes$bg_white_50 = 'bg-white-50';
var _justgage$tachyons_elm$Tachyons_Classes$bg_white_40 = 'bg-white-40';
var _justgage$tachyons_elm$Tachyons_Classes$bg_white_30 = 'bg-white-30';
var _justgage$tachyons_elm$Tachyons_Classes$bg_white_20 = 'bg-white-20';
var _justgage$tachyons_elm$Tachyons_Classes$bg_white_10 = 'bg-white-10';
var _justgage$tachyons_elm$Tachyons_Classes$bg_white = 'bg-white';
var _justgage$tachyons_elm$Tachyons_Classes$bg_washed_yellow = 'bg-washed-yellow';
var _justgage$tachyons_elm$Tachyons_Classes$bg_washed_red = 'bg-washed-red';
var _justgage$tachyons_elm$Tachyons_Classes$bg_washed_green = 'bg-washed-green';
var _justgage$tachyons_elm$Tachyons_Classes$bg_washed_blue = 'bg-washed-blue';
var _justgage$tachyons_elm$Tachyons_Classes$bg_transparent = 'bg-transparent';
var _justgage$tachyons_elm$Tachyons_Classes$bg_top_ns = 'bg-top-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bg_top_m = 'bg-top-m';
var _justgage$tachyons_elm$Tachyons_Classes$bg_top_l = 'bg-top-l';
var _justgage$tachyons_elm$Tachyons_Classes$bg_top = 'bg-top';
var _justgage$tachyons_elm$Tachyons_Classes$bg_silver = 'bg-silver';
var _justgage$tachyons_elm$Tachyons_Classes$bg_right_ns = 'bg-right-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bg_right_m = 'bg-right-m';
var _justgage$tachyons_elm$Tachyons_Classes$bg_right_l = 'bg-right-l';
var _justgage$tachyons_elm$Tachyons_Classes$bg_right = 'bg-right';
var _justgage$tachyons_elm$Tachyons_Classes$bg_red = 'bg-red';
var _justgage$tachyons_elm$Tachyons_Classes$bg_purple = 'bg-purple';
var _justgage$tachyons_elm$Tachyons_Classes$bg_pink = 'bg-pink';
var _justgage$tachyons_elm$Tachyons_Classes$bg_orange = 'bg-orange';
var _justgage$tachyons_elm$Tachyons_Classes$bg_near_white = 'bg-near-white';
var _justgage$tachyons_elm$Tachyons_Classes$bg_near_black = 'bg-near-black';
var _justgage$tachyons_elm$Tachyons_Classes$bg_navy = 'bg-navy';
var _justgage$tachyons_elm$Tachyons_Classes$bg_moon_gray = 'bg-moon-gray';
var _justgage$tachyons_elm$Tachyons_Classes$bg_mid_gray = 'bg-mid-gray';
var _justgage$tachyons_elm$Tachyons_Classes$bg_lightest_blue = 'bg-lightest-blue';
var _justgage$tachyons_elm$Tachyons_Classes$bg_light_yellow = 'bg-light-yellow';
var _justgage$tachyons_elm$Tachyons_Classes$bg_light_silver = 'bg-light-silver';
var _justgage$tachyons_elm$Tachyons_Classes$bg_light_red = 'bg-light-red';
var _justgage$tachyons_elm$Tachyons_Classes$bg_light_purple = 'bg-light-purple';
var _justgage$tachyons_elm$Tachyons_Classes$bg_light_pink = 'bg-light-pink';
var _justgage$tachyons_elm$Tachyons_Classes$bg_light_green = 'bg-light-green';
var _justgage$tachyons_elm$Tachyons_Classes$bg_light_gray = 'bg-light-gray';
var _justgage$tachyons_elm$Tachyons_Classes$bg_light_blue = 'bg-light-blue';
var _justgage$tachyons_elm$Tachyons_Classes$bg_left_ns = 'bg-left-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bg_left_m = 'bg-left-m';
var _justgage$tachyons_elm$Tachyons_Classes$bg_left_l = 'bg-left-l';
var _justgage$tachyons_elm$Tachyons_Classes$bg_left = 'bg-left';
var _justgage$tachyons_elm$Tachyons_Classes$bg_inherit = 'bg-inherit';
var _justgage$tachyons_elm$Tachyons_Classes$bg_hot_pink = 'bg-hot-pink';
var _justgage$tachyons_elm$Tachyons_Classes$bg_green = 'bg-green';
var _justgage$tachyons_elm$Tachyons_Classes$bg_gray = 'bg-gray';
var _justgage$tachyons_elm$Tachyons_Classes$bg_gold = 'bg-gold';
var _justgage$tachyons_elm$Tachyons_Classes$bg_dark_red = 'bg-dark-red';
var _justgage$tachyons_elm$Tachyons_Classes$bg_dark_pink = 'bg-dark-pink';
var _justgage$tachyons_elm$Tachyons_Classes$bg_dark_green = 'bg-dark-green';
var _justgage$tachyons_elm$Tachyons_Classes$bg_dark_gray = 'bg-dark-gray';
var _justgage$tachyons_elm$Tachyons_Classes$bg_dark_blue = 'bg-dark-blue';
var _justgage$tachyons_elm$Tachyons_Classes$bg_center_ns = 'bg-center-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bg_center_m = 'bg-center-m';
var _justgage$tachyons_elm$Tachyons_Classes$bg_center_l = 'bg-center-l';
var _justgage$tachyons_elm$Tachyons_Classes$bg_center = 'bg-center';
var _justgage$tachyons_elm$Tachyons_Classes$bg_bottom_ns = 'bg-bottom-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bg_bottom_m = 'bg-bottom-m';
var _justgage$tachyons_elm$Tachyons_Classes$bg_bottom_l = 'bg-bottom-l';
var _justgage$tachyons_elm$Tachyons_Classes$bg_bottom = 'bg-bottom';
var _justgage$tachyons_elm$Tachyons_Classes$bg_blue = 'bg-blue';
var _justgage$tachyons_elm$Tachyons_Classes$bg_black_90 = 'bg-black-90';
var _justgage$tachyons_elm$Tachyons_Classes$bg_black_80 = 'bg-black-80';
var _justgage$tachyons_elm$Tachyons_Classes$bg_black_70 = 'bg-black-70';
var _justgage$tachyons_elm$Tachyons_Classes$bg_black_60 = 'bg-black-60';
var _justgage$tachyons_elm$Tachyons_Classes$bg_black_50 = 'bg-black-50';
var _justgage$tachyons_elm$Tachyons_Classes$bg_black_40 = 'bg-black-40';
var _justgage$tachyons_elm$Tachyons_Classes$bg_black_30 = 'bg-black-30';
var _justgage$tachyons_elm$Tachyons_Classes$bg_black_20 = 'bg-black-20';
var _justgage$tachyons_elm$Tachyons_Classes$bg_black_10 = 'bg-black-10';
var _justgage$tachyons_elm$Tachyons_Classes$bg_black_05 = 'bg-black-05';
var _justgage$tachyons_elm$Tachyons_Classes$bg_black = 'bg-black';
var _justgage$tachyons_elm$Tachyons_Classes$bg_animate = 'bg-animate';
var _justgage$tachyons_elm$Tachyons_Classes$bb_ns = 'bb-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bb_m = 'bb-m';
var _justgage$tachyons_elm$Tachyons_Classes$bb_l = 'bb-l';
var _justgage$tachyons_elm$Tachyons_Classes$bb_0_ns = 'bb-0-ns';
var _justgage$tachyons_elm$Tachyons_Classes$bb_0_m = 'bb-0-m';
var _justgage$tachyons_elm$Tachyons_Classes$bb_0_l = 'bb-0-l';
var _justgage$tachyons_elm$Tachyons_Classes$bb_0 = 'bb-0';
var _justgage$tachyons_elm$Tachyons_Classes$bb = 'bb';
var _justgage$tachyons_elm$Tachyons_Classes$baskerville = 'baskerville';
var _justgage$tachyons_elm$Tachyons_Classes$ba_ns = 'ba-ns';
var _justgage$tachyons_elm$Tachyons_Classes$ba_m = 'ba-m';
var _justgage$tachyons_elm$Tachyons_Classes$ba_l = 'ba-l';
var _justgage$tachyons_elm$Tachyons_Classes$ba = 'ba';
var _justgage$tachyons_elm$Tachyons_Classes$b_ns = 'b-ns';
var _justgage$tachyons_elm$Tachyons_Classes$b_m = 'b-m';
var _justgage$tachyons_elm$Tachyons_Classes$b_l = 'b-l';
var _justgage$tachyons_elm$Tachyons_Classes$b__yellow = 'b--yellow';
var _justgage$tachyons_elm$Tachyons_Classes$b__white_90 = 'b--white-90';
var _justgage$tachyons_elm$Tachyons_Classes$b__white_80 = 'b--white-80';
var _justgage$tachyons_elm$Tachyons_Classes$b__white_70 = 'b--white-70';
var _justgage$tachyons_elm$Tachyons_Classes$b__white_60 = 'b--white-60';
var _justgage$tachyons_elm$Tachyons_Classes$b__white_50 = 'b--white-50';
var _justgage$tachyons_elm$Tachyons_Classes$b__white_40 = 'b--white-40';
var _justgage$tachyons_elm$Tachyons_Classes$b__white_30 = 'b--white-30';
var _justgage$tachyons_elm$Tachyons_Classes$b__white_20 = 'b--white-20';
var _justgage$tachyons_elm$Tachyons_Classes$b__white_10 = 'b--white-10';
var _justgage$tachyons_elm$Tachyons_Classes$b__white_05 = 'b--white-05';
var _justgage$tachyons_elm$Tachyons_Classes$b__white_025 = 'b--white-025';
var _justgage$tachyons_elm$Tachyons_Classes$b__white_0125 = 'b--white-0125';
var _justgage$tachyons_elm$Tachyons_Classes$b__white = 'b--white';
var _justgage$tachyons_elm$Tachyons_Classes$b__washed_yellow = 'b--washed-yellow';
var _justgage$tachyons_elm$Tachyons_Classes$b__washed_red = 'b--washed-red';
var _justgage$tachyons_elm$Tachyons_Classes$b__washed_green = 'b--washed-green';
var _justgage$tachyons_elm$Tachyons_Classes$b__washed_blue = 'b--washed-blue';
var _justgage$tachyons_elm$Tachyons_Classes$b__transparent = 'b--transparent';
var _justgage$tachyons_elm$Tachyons_Classes$b__solid_ns = 'b--solid-ns';
var _justgage$tachyons_elm$Tachyons_Classes$b__solid_m = 'b--solid-m';
var _justgage$tachyons_elm$Tachyons_Classes$b__solid_l = 'b--solid-l';
var _justgage$tachyons_elm$Tachyons_Classes$b__solid = 'b--solid';
var _justgage$tachyons_elm$Tachyons_Classes$b__silver = 'b--silver';
var _justgage$tachyons_elm$Tachyons_Classes$b__red = 'b--red';
var _justgage$tachyons_elm$Tachyons_Classes$b__purple = 'b--purple';
var _justgage$tachyons_elm$Tachyons_Classes$b__pink = 'b--pink';
var _justgage$tachyons_elm$Tachyons_Classes$b__orange = 'b--orange';
var _justgage$tachyons_elm$Tachyons_Classes$b__none_ns = 'b--none-ns';
var _justgage$tachyons_elm$Tachyons_Classes$b__none_m = 'b--none-m';
var _justgage$tachyons_elm$Tachyons_Classes$b__none_l = 'b--none-l';
var _justgage$tachyons_elm$Tachyons_Classes$b__none = 'b--none';
var _justgage$tachyons_elm$Tachyons_Classes$b__near_white = 'b--near-white';
var _justgage$tachyons_elm$Tachyons_Classes$b__near_black = 'b--near-black';
var _justgage$tachyons_elm$Tachyons_Classes$b__navy = 'b--navy';
var _justgage$tachyons_elm$Tachyons_Classes$b__moon_gray = 'b--moon-gray';
var _justgage$tachyons_elm$Tachyons_Classes$b__mid_gray = 'b--mid-gray';
var _justgage$tachyons_elm$Tachyons_Classes$b__lightest_blue = 'b--lightest-blue';
var _justgage$tachyons_elm$Tachyons_Classes$b__light_yellow = 'b--light-yellow';
var _justgage$tachyons_elm$Tachyons_Classes$b__light_silver = 'b--light-silver';
var _justgage$tachyons_elm$Tachyons_Classes$b__light_red = 'b--light-red';
var _justgage$tachyons_elm$Tachyons_Classes$b__light_purple = 'b--light-purple';
var _justgage$tachyons_elm$Tachyons_Classes$b__light_pink = 'b--light-pink';
var _justgage$tachyons_elm$Tachyons_Classes$b__light_green = 'b--light-green';
var _justgage$tachyons_elm$Tachyons_Classes$b__light_gray = 'b--light-gray';
var _justgage$tachyons_elm$Tachyons_Classes$b__light_blue = 'b--light-blue';
var _justgage$tachyons_elm$Tachyons_Classes$b__inherit = 'b--inherit';
var _justgage$tachyons_elm$Tachyons_Classes$b__hot_pink = 'b--hot-pink';
var _justgage$tachyons_elm$Tachyons_Classes$b__green = 'b--green';
var _justgage$tachyons_elm$Tachyons_Classes$b__gray = 'b--gray';
var _justgage$tachyons_elm$Tachyons_Classes$b__gold = 'b--gold';
var _justgage$tachyons_elm$Tachyons_Classes$b__dotted_ns = 'b--dotted-ns';
var _justgage$tachyons_elm$Tachyons_Classes$b__dotted_m = 'b--dotted-m';
var _justgage$tachyons_elm$Tachyons_Classes$b__dotted_l = 'b--dotted-l';
var _justgage$tachyons_elm$Tachyons_Classes$b__dotted = 'b--dotted';
var _justgage$tachyons_elm$Tachyons_Classes$b__dashed_ns = 'b--dashed-ns';
var _justgage$tachyons_elm$Tachyons_Classes$b__dashed_m = 'b--dashed-m';
var _justgage$tachyons_elm$Tachyons_Classes$b__dashed_l = 'b--dashed-l';
var _justgage$tachyons_elm$Tachyons_Classes$b__dashed = 'b--dashed';
var _justgage$tachyons_elm$Tachyons_Classes$b__dark_red = 'b--dark-red';
var _justgage$tachyons_elm$Tachyons_Classes$b__dark_pink = 'b--dark-pink';
var _justgage$tachyons_elm$Tachyons_Classes$b__dark_green = 'b--dark-green';
var _justgage$tachyons_elm$Tachyons_Classes$b__dark_gray = 'b--dark-gray';
var _justgage$tachyons_elm$Tachyons_Classes$b__dark_blue = 'b--dark-blue';
var _justgage$tachyons_elm$Tachyons_Classes$b__blue = 'b--blue';
var _justgage$tachyons_elm$Tachyons_Classes$b__black_90 = 'b--black-90';
var _justgage$tachyons_elm$Tachyons_Classes$b__black_80 = 'b--black-80';
var _justgage$tachyons_elm$Tachyons_Classes$b__black_70 = 'b--black-70';
var _justgage$tachyons_elm$Tachyons_Classes$b__black_60 = 'b--black-60';
var _justgage$tachyons_elm$Tachyons_Classes$b__black_50 = 'b--black-50';
var _justgage$tachyons_elm$Tachyons_Classes$b__black_40 = 'b--black-40';
var _justgage$tachyons_elm$Tachyons_Classes$b__black_30 = 'b--black-30';
var _justgage$tachyons_elm$Tachyons_Classes$b__black_20 = 'b--black-20';
var _justgage$tachyons_elm$Tachyons_Classes$b__black_10 = 'b--black-10';
var _justgage$tachyons_elm$Tachyons_Classes$b__black_05 = 'b--black-05';
var _justgage$tachyons_elm$Tachyons_Classes$b__black_025 = 'b--black-025';
var _justgage$tachyons_elm$Tachyons_Classes$b__black_0125 = 'b--black-0125';
var _justgage$tachyons_elm$Tachyons_Classes$b__black = 'b--black';
var _justgage$tachyons_elm$Tachyons_Classes$b = 'b';
var _justgage$tachyons_elm$Tachyons_Classes$avenir = 'avenir';
var _justgage$tachyons_elm$Tachyons_Classes$athelas = 'athelas';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio_ns = 'aspect-ratio-ns';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio_m = 'aspect-ratio-m';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio_l = 'aspect-ratio-l';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__object_ns = 'aspect-ratio--object-ns';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__object_m = 'aspect-ratio--object-m';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__object_l = 'aspect-ratio--object-l';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__object = 'aspect-ratio--object';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__9x16_ns = 'aspect-ratio--9x16-ns';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__9x16_m = 'aspect-ratio--9x16-m';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__9x16_l = 'aspect-ratio--9x16-l';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__9x16 = 'aspect-ratio--9x16';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__8x5_ns = 'aspect-ratio--8x5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__8x5_m = 'aspect-ratio--8x5-m';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__8x5_l = 'aspect-ratio--8x5-l';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__8x5 = 'aspect-ratio--8x5';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__7x5_ns = 'aspect-ratio--7x5-ns';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__7x5_m = 'aspect-ratio--7x5-m';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__7x5_l = 'aspect-ratio--7x5-l';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__7x5 = 'aspect-ratio--7x5';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__6x4_ns = 'aspect-ratio--6x4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__6x4_m = 'aspect-ratio--6x4-m';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__6x4_l = 'aspect-ratio--6x4-l';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__6x4 = 'aspect-ratio--6x4';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__5x8_ns = 'aspect-ratio--5x8-ns';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__5x8_m = 'aspect-ratio--5x8-m';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__5x8_l = 'aspect-ratio--5x8-l';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__5x8 = 'aspect-ratio--5x8';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__5x7_ns = 'aspect-ratio--5x7-ns';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__5x7_m = 'aspect-ratio--5x7-m';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__5x7_l = 'aspect-ratio--5x7-l';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__5x7 = 'aspect-ratio--5x7';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__4x6_ns = 'aspect-ratio--4x6-ns';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__4x6_m = 'aspect-ratio--4x6-m';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__4x6_l = 'aspect-ratio--4x6-l';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__4x6 = 'aspect-ratio--4x6';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__4x3_ns = 'aspect-ratio--4x3-ns';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__4x3_m = 'aspect-ratio--4x3-m';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__4x3_l = 'aspect-ratio--4x3-l';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__4x3 = 'aspect-ratio--4x3';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__3x4_ns = 'aspect-ratio--3x4-ns';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__3x4_m = 'aspect-ratio--3x4-m';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__3x4_l = 'aspect-ratio--3x4-l';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__3x4 = 'aspect-ratio--3x4';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__1x1_ns = 'aspect-ratio--1x1-ns';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__1x1_m = 'aspect-ratio--1x1-m';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__1x1_l = 'aspect-ratio--1x1-l';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__1x1 = 'aspect-ratio--1x1';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__16x9_ns = 'aspect-ratio--16x9-ns';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__16x9_m = 'aspect-ratio--16x9-m';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__16x9_l = 'aspect-ratio--16x9-l';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio__16x9 = 'aspect-ratio--16x9';
var _justgage$tachyons_elm$Tachyons_Classes$aspect_ratio = 'aspect-ratio';
var _justgage$tachyons_elm$Tachyons_Classes$absolute_ns = 'absolute-ns';
var _justgage$tachyons_elm$Tachyons_Classes$absolute_m = 'absolute-m';
var _justgage$tachyons_elm$Tachyons_Classes$absolute_l = 'absolute-l';
var _justgage$tachyons_elm$Tachyons_Classes$absolute__fill_ns = 'absolute--fill-ns';
var _justgage$tachyons_elm$Tachyons_Classes$absolute__fill_m = 'absolute--fill-m';
var _justgage$tachyons_elm$Tachyons_Classes$absolute__fill_l = 'absolute--fill-l';
var _justgage$tachyons_elm$Tachyons_Classes$absolute__fill = 'absolute--fill';
var _justgage$tachyons_elm$Tachyons_Classes$absolute = 'absolute';

var _user$project$Main$textCopy = function (copy) {
	return A2(
		_elm_lang$html$Html$p,
		{
			ctor: '::',
			_0: _justgage$tachyons_elm$Tachyons$classes(
				{
					ctor: '::',
					_0: _justgage$tachyons_elm$Tachyons_Classes$lh_copy,
					_1: {
						ctor: '::',
						_0: _justgage$tachyons_elm$Tachyons_Classes$helvetica,
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(copy),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$mainTitle = function (title) {
	return A2(
		_elm_lang$html$Html$h1,
		{
			ctor: '::',
			_0: _justgage$tachyons_elm$Tachyons$classes(
				{
					ctor: '::',
					_0: _justgage$tachyons_elm$Tachyons_Classes$mt0,
					_1: {
						ctor: '::',
						_0: _justgage$tachyons_elm$Tachyons_Classes$f3,
						_1: {
							ctor: '::',
							_0: _justgage$tachyons_elm$Tachyons_Classes$f2_m,
							_1: {
								ctor: '::',
								_0: _justgage$tachyons_elm$Tachyons_Classes$f1_l,
								_1: {
									ctor: '::',
									_0: _justgage$tachyons_elm$Tachyons_Classes$fw1,
									_1: {
										ctor: '::',
										_0: _justgage$tachyons_elm$Tachyons_Classes$baskerville,
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(title),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$stylesheet = function (url) {
	return A3(
		_elm_lang$html$Html$node,
		'link',
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$rel('stylesheet'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$href(url),
				_1: {ctor: '[]'}
			}
		},
		{ctor: '[]'});
};
var _user$project$Main$view = function () {
	var intro = _user$project$Main$textCopy('Brainloller is a Brainfuck clone designed by Lode Vandevenne in 2005. Commands are read from the pixels of a .png image (like Piet), with 2 extra commands. The extra commands change the instruction pointer direction so that you can compact the 1D Brainfuck code into a 2D image. You can hide Brainloller code in a photo or draw comments.');
	var title = _user$project$Main$mainTitle('Brainloller');
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _justgage$tachyons_elm$Tachyons$classes(
				{
					ctor: '::',
					_0: _justgage$tachyons_elm$Tachyons_Classes$cf,
					_1: {
						ctor: '::',
						_0: _justgage$tachyons_elm$Tachyons_Classes$pa3,
						_1: {
							ctor: '::',
							_0: _justgage$tachyons_elm$Tachyons_Classes$pa4_ns,
							_1: {
								ctor: '::',
								_0: 'container',
								_1: {ctor: '[]'}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _user$project$Main$stylesheet('/build/tachyons.min.css'),
			_1: {
				ctor: '::',
				_0: _user$project$Main$stylesheet('/assets/styles/editor.css'),
				_1: {
					ctor: '::',
					_0: title,
					_1: {
						ctor: '::',
						_0: intro,
						_1: {ctor: '[]'}
					}
				}
			}
		});
}();
var _user$project$Main$main = _elm_lang$virtual_dom$Native_VirtualDom.staticProgram(_user$project$Main$view);

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _user$project$Main$main !== 'undefined') {
    _user$project$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

