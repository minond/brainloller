
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

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

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

var _elm_lang$core$Set$foldr = F3(
	function (f, b, _p0) {
		var _p1 = _p0;
		return A3(
			_elm_lang$core$Dict$foldr,
			F3(
				function (k, _p2, b) {
					return A2(f, k, b);
				}),
			b,
			_p1._0);
	});
var _elm_lang$core$Set$foldl = F3(
	function (f, b, _p3) {
		var _p4 = _p3;
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, _p5, b) {
					return A2(f, k, b);
				}),
			b,
			_p4._0);
	});
var _elm_lang$core$Set$toList = function (_p6) {
	var _p7 = _p6;
	return _elm_lang$core$Dict$keys(_p7._0);
};
var _elm_lang$core$Set$size = function (_p8) {
	var _p9 = _p8;
	return _elm_lang$core$Dict$size(_p9._0);
};
var _elm_lang$core$Set$member = F2(
	function (k, _p10) {
		var _p11 = _p10;
		return A2(_elm_lang$core$Dict$member, k, _p11._0);
	});
var _elm_lang$core$Set$isEmpty = function (_p12) {
	var _p13 = _p12;
	return _elm_lang$core$Dict$isEmpty(_p13._0);
};
var _elm_lang$core$Set$Set_elm_builtin = function (a) {
	return {ctor: 'Set_elm_builtin', _0: a};
};
var _elm_lang$core$Set$empty = _elm_lang$core$Set$Set_elm_builtin(_elm_lang$core$Dict$empty);
var _elm_lang$core$Set$singleton = function (k) {
	return _elm_lang$core$Set$Set_elm_builtin(
		A2(
			_elm_lang$core$Dict$singleton,
			k,
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Set$insert = F2(
	function (k, _p14) {
		var _p15 = _p14;
		return _elm_lang$core$Set$Set_elm_builtin(
			A3(
				_elm_lang$core$Dict$insert,
				k,
				{ctor: '_Tuple0'},
				_p15._0));
	});
var _elm_lang$core$Set$fromList = function (xs) {
	return A3(_elm_lang$core$List$foldl, _elm_lang$core$Set$insert, _elm_lang$core$Set$empty, xs);
};
var _elm_lang$core$Set$map = F2(
	function (f, s) {
		return _elm_lang$core$Set$fromList(
			A2(
				_elm_lang$core$List$map,
				f,
				_elm_lang$core$Set$toList(s)));
	});
var _elm_lang$core$Set$remove = F2(
	function (k, _p16) {
		var _p17 = _p16;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$remove, k, _p17._0));
	});
var _elm_lang$core$Set$union = F2(
	function (_p19, _p18) {
		var _p20 = _p19;
		var _p21 = _p18;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$union, _p20._0, _p21._0));
	});
var _elm_lang$core$Set$intersect = F2(
	function (_p23, _p22) {
		var _p24 = _p23;
		var _p25 = _p22;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$intersect, _p24._0, _p25._0));
	});
var _elm_lang$core$Set$diff = F2(
	function (_p27, _p26) {
		var _p28 = _p27;
		var _p29 = _p26;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$diff, _p28._0, _p29._0));
	});
var _elm_lang$core$Set$filter = F2(
	function (p, _p30) {
		var _p31 = _p30;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(
				_elm_lang$core$Dict$filter,
				F2(
					function (k, _p32) {
						return p(k);
					}),
				_p31._0));
	});
var _elm_lang$core$Set$partition = F2(
	function (p, _p33) {
		var _p34 = _p33;
		var _p35 = A2(
			_elm_lang$core$Dict$partition,
			F2(
				function (k, _p36) {
					return p(k);
				}),
			_p34._0);
		var p1 = _p35._0;
		var p2 = _p35._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Set$Set_elm_builtin(p1),
			_1: _elm_lang$core$Set$Set_elm_builtin(p2)
		};
	});

var _elm_community$list_extra$List_Extra$greedyGroupsOfWithStep = F3(
	function (size, step, xs) {
		var okayXs = _elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$List$length(xs),
			0) > 0;
		var okayArgs = (_elm_lang$core$Native_Utils.cmp(size, 0) > 0) && (_elm_lang$core$Native_Utils.cmp(step, 0) > 0);
		var xs_ = A2(_elm_lang$core$List$drop, step, xs);
		var group = A2(_elm_lang$core$List$take, size, xs);
		return (okayArgs && okayXs) ? {
			ctor: '::',
			_0: group,
			_1: A3(_elm_community$list_extra$List_Extra$greedyGroupsOfWithStep, size, step, xs_)
		} : {ctor: '[]'};
	});
var _elm_community$list_extra$List_Extra$greedyGroupsOf = F2(
	function (size, xs) {
		return A3(_elm_community$list_extra$List_Extra$greedyGroupsOfWithStep, size, size, xs);
	});
var _elm_community$list_extra$List_Extra$groupsOfWithStep = F3(
	function (size, step, xs) {
		var okayArgs = (_elm_lang$core$Native_Utils.cmp(size, 0) > 0) && (_elm_lang$core$Native_Utils.cmp(step, 0) > 0);
		var xs_ = A2(_elm_lang$core$List$drop, step, xs);
		var group = A2(_elm_lang$core$List$take, size, xs);
		var okayLength = _elm_lang$core$Native_Utils.eq(
			size,
			_elm_lang$core$List$length(group));
		return (okayArgs && okayLength) ? {
			ctor: '::',
			_0: group,
			_1: A3(_elm_community$list_extra$List_Extra$groupsOfWithStep, size, step, xs_)
		} : {ctor: '[]'};
	});
var _elm_community$list_extra$List_Extra$groupsOf = F2(
	function (size, xs) {
		return A3(_elm_community$list_extra$List_Extra$groupsOfWithStep, size, size, xs);
	});
var _elm_community$list_extra$List_Extra$zip5 = _elm_lang$core$List$map5(
	F5(
		function (v0, v1, v2, v3, v4) {
			return {ctor: '_Tuple5', _0: v0, _1: v1, _2: v2, _3: v3, _4: v4};
		}));
var _elm_community$list_extra$List_Extra$zip4 = _elm_lang$core$List$map4(
	F4(
		function (v0, v1, v2, v3) {
			return {ctor: '_Tuple4', _0: v0, _1: v1, _2: v2, _3: v3};
		}));
var _elm_community$list_extra$List_Extra$zip3 = _elm_lang$core$List$map3(
	F3(
		function (v0, v1, v2) {
			return {ctor: '_Tuple3', _0: v0, _1: v1, _2: v2};
		}));
var _elm_community$list_extra$List_Extra$zip = _elm_lang$core$List$map2(
	F2(
		function (v0, v1) {
			return {ctor: '_Tuple2', _0: v0, _1: v1};
		}));
var _elm_community$list_extra$List_Extra$isPrefixOf = F2(
	function (prefix, xs) {
		var _p0 = {ctor: '_Tuple2', _0: prefix, _1: xs};
		if (_p0._0.ctor === '[]') {
			return true;
		} else {
			if (_p0._1.ctor === '[]') {
				return false;
			} else {
				return _elm_lang$core$Native_Utils.eq(_p0._0._0, _p0._1._0) && A2(_elm_community$list_extra$List_Extra$isPrefixOf, _p0._0._1, _p0._1._1);
			}
		}
	});
var _elm_community$list_extra$List_Extra$isSuffixOf = F2(
	function (suffix, xs) {
		return A2(
			_elm_community$list_extra$List_Extra$isPrefixOf,
			_elm_lang$core$List$reverse(suffix),
			_elm_lang$core$List$reverse(xs));
	});
var _elm_community$list_extra$List_Extra$selectSplit = function (xs) {
	var _p1 = xs;
	if (_p1.ctor === '[]') {
		return {ctor: '[]'};
	} else {
		var _p5 = _p1._1;
		var _p4 = _p1._0;
		return {
			ctor: '::',
			_0: {
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _p4,
				_2: _p5
			},
			_1: A2(
				_elm_lang$core$List$map,
				function (_p2) {
					var _p3 = _p2;
					return {
						ctor: '_Tuple3',
						_0: {ctor: '::', _0: _p4, _1: _p3._0},
						_1: _p3._1,
						_2: _p3._2
					};
				},
				_elm_community$list_extra$List_Extra$selectSplit(_p5))
		};
	}
};
var _elm_community$list_extra$List_Extra$select = function (xs) {
	var _p6 = xs;
	if (_p6.ctor === '[]') {
		return {ctor: '[]'};
	} else {
		var _p10 = _p6._1;
		var _p9 = _p6._0;
		return {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: _p9, _1: _p10},
			_1: A2(
				_elm_lang$core$List$map,
				function (_p7) {
					var _p8 = _p7;
					return {
						ctor: '_Tuple2',
						_0: _p8._0,
						_1: {ctor: '::', _0: _p9, _1: _p8._1}
					};
				},
				_elm_community$list_extra$List_Extra$select(_p10))
		};
	}
};
var _elm_community$list_extra$List_Extra$tailsHelp = F2(
	function (e, list) {
		var _p11 = list;
		if (_p11.ctor === '::') {
			var _p12 = _p11._0;
			return {
				ctor: '::',
				_0: {ctor: '::', _0: e, _1: _p12},
				_1: {ctor: '::', _0: _p12, _1: _p11._1}
			};
		} else {
			return {ctor: '[]'};
		}
	});
var _elm_community$list_extra$List_Extra$tails = A2(
	_elm_lang$core$List$foldr,
	_elm_community$list_extra$List_Extra$tailsHelp,
	{
		ctor: '::',
		_0: {ctor: '[]'},
		_1: {ctor: '[]'}
	});
var _elm_community$list_extra$List_Extra$isInfixOf = F2(
	function (infix, xs) {
		return A2(
			_elm_lang$core$List$any,
			_elm_community$list_extra$List_Extra$isPrefixOf(infix),
			_elm_community$list_extra$List_Extra$tails(xs));
	});
var _elm_community$list_extra$List_Extra$inits = A2(
	_elm_lang$core$List$foldr,
	F2(
		function (e, acc) {
			return {
				ctor: '::',
				_0: {ctor: '[]'},
				_1: A2(
					_elm_lang$core$List$map,
					F2(
						function (x, y) {
							return {ctor: '::', _0: x, _1: y};
						})(e),
					acc)
			};
		}),
	{
		ctor: '::',
		_0: {ctor: '[]'},
		_1: {ctor: '[]'}
	});
var _elm_community$list_extra$List_Extra$groupWhileTransitively = F2(
	function (cmp, xs_) {
		var _p13 = xs_;
		if (_p13.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			if (_p13._1.ctor === '[]') {
				return {
					ctor: '::',
					_0: {
						ctor: '::',
						_0: _p13._0,
						_1: {ctor: '[]'}
					},
					_1: {ctor: '[]'}
				};
			} else {
				var _p15 = _p13._0;
				var _p14 = A2(_elm_community$list_extra$List_Extra$groupWhileTransitively, cmp, _p13._1);
				if (_p14.ctor === '::') {
					return A2(cmp, _p15, _p13._1._0) ? {
						ctor: '::',
						_0: {ctor: '::', _0: _p15, _1: _p14._0},
						_1: _p14._1
					} : {
						ctor: '::',
						_0: {
							ctor: '::',
							_0: _p15,
							_1: {ctor: '[]'}
						},
						_1: _p14
					};
				} else {
					return {ctor: '[]'};
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$stripPrefix = F2(
	function (prefix, xs) {
		var step = F2(
			function (e, m) {
				var _p16 = m;
				if (_p16.ctor === 'Nothing') {
					return _elm_lang$core$Maybe$Nothing;
				} else {
					if (_p16._0.ctor === '[]') {
						return _elm_lang$core$Maybe$Nothing;
					} else {
						return _elm_lang$core$Native_Utils.eq(e, _p16._0._0) ? _elm_lang$core$Maybe$Just(_p16._0._1) : _elm_lang$core$Maybe$Nothing;
					}
				}
			});
		return A3(
			_elm_lang$core$List$foldl,
			step,
			_elm_lang$core$Maybe$Just(xs),
			prefix);
	});
var _elm_community$list_extra$List_Extra$dropWhileRight = function (p) {
	return A2(
		_elm_lang$core$List$foldr,
		F2(
			function (x, xs) {
				return (p(x) && _elm_lang$core$List$isEmpty(xs)) ? {ctor: '[]'} : {ctor: '::', _0: x, _1: xs};
			}),
		{ctor: '[]'});
};
var _elm_community$list_extra$List_Extra$takeWhileRight = function (p) {
	var step = F2(
		function (x, _p17) {
			var _p18 = _p17;
			var _p19 = _p18._0;
			return (p(x) && _p18._1) ? {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: x, _1: _p19},
				_1: true
			} : {ctor: '_Tuple2', _0: _p19, _1: false};
		});
	return function (_p20) {
		return _elm_lang$core$Tuple$first(
			A3(
				_elm_lang$core$List$foldr,
				step,
				{
					ctor: '_Tuple2',
					_0: {ctor: '[]'},
					_1: true
				},
				_p20));
	};
};
var _elm_community$list_extra$List_Extra$splitAt = F2(
	function (n, xs) {
		return {
			ctor: '_Tuple2',
			_0: A2(_elm_lang$core$List$take, n, xs),
			_1: A2(_elm_lang$core$List$drop, n, xs)
		};
	});
var _elm_community$list_extra$List_Extra$groupsOfVarying_ = F3(
	function (listOflengths, list, accu) {
		groupsOfVarying_:
		while (true) {
			var _p21 = {ctor: '_Tuple2', _0: listOflengths, _1: list};
			if (((_p21.ctor === '_Tuple2') && (_p21._0.ctor === '::')) && (_p21._1.ctor === '::')) {
				var _p22 = A2(_elm_community$list_extra$List_Extra$splitAt, _p21._0._0, list);
				var head = _p22._0;
				var tail = _p22._1;
				var _v11 = _p21._0._1,
					_v12 = tail,
					_v13 = {ctor: '::', _0: head, _1: accu};
				listOflengths = _v11;
				list = _v12;
				accu = _v13;
				continue groupsOfVarying_;
			} else {
				return _elm_lang$core$List$reverse(accu);
			}
		}
	});
var _elm_community$list_extra$List_Extra$groupsOfVarying = F2(
	function (listOflengths, list) {
		return A3(
			_elm_community$list_extra$List_Extra$groupsOfVarying_,
			listOflengths,
			list,
			{ctor: '[]'});
	});
var _elm_community$list_extra$List_Extra$unfoldr = F2(
	function (f, seed) {
		var _p23 = f(seed);
		if (_p23.ctor === 'Nothing') {
			return {ctor: '[]'};
		} else {
			return {
				ctor: '::',
				_0: _p23._0._0,
				_1: A2(_elm_community$list_extra$List_Extra$unfoldr, f, _p23._0._1)
			};
		}
	});
var _elm_community$list_extra$List_Extra$scanr1 = F2(
	function (f, xs_) {
		var _p24 = xs_;
		if (_p24.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			if (_p24._1.ctor === '[]') {
				return {
					ctor: '::',
					_0: _p24._0,
					_1: {ctor: '[]'}
				};
			} else {
				var _p25 = A2(_elm_community$list_extra$List_Extra$scanr1, f, _p24._1);
				if (_p25.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, _p24._0, _p25._0),
						_1: _p25
					};
				} else {
					return {ctor: '[]'};
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$scanr = F3(
	function (f, acc, xs_) {
		var _p26 = xs_;
		if (_p26.ctor === '[]') {
			return {
				ctor: '::',
				_0: acc,
				_1: {ctor: '[]'}
			};
		} else {
			var _p27 = A3(_elm_community$list_extra$List_Extra$scanr, f, acc, _p26._1);
			if (_p27.ctor === '::') {
				return {
					ctor: '::',
					_0: A2(f, _p26._0, _p27._0),
					_1: _p27
				};
			} else {
				return {ctor: '[]'};
			}
		}
	});
var _elm_community$list_extra$List_Extra$scanl1 = F2(
	function (f, xs_) {
		var _p28 = xs_;
		if (_p28.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			return A3(_elm_lang$core$List$scanl, f, _p28._0, _p28._1);
		}
	});
var _elm_community$list_extra$List_Extra$indexedFoldr = F3(
	function (func, acc, list) {
		var step = F2(
			function (x, _p29) {
				var _p30 = _p29;
				var _p31 = _p30._0;
				return {
					ctor: '_Tuple2',
					_0: _p31 - 1,
					_1: A3(func, _p31, x, _p30._1)
				};
			});
		return _elm_lang$core$Tuple$second(
			A3(
				_elm_lang$core$List$foldr,
				step,
				{
					ctor: '_Tuple2',
					_0: _elm_lang$core$List$length(list) - 1,
					_1: acc
				},
				list));
	});
var _elm_community$list_extra$List_Extra$indexedFoldl = F3(
	function (func, acc, list) {
		var step = F2(
			function (x, _p32) {
				var _p33 = _p32;
				var _p34 = _p33._0;
				return {
					ctor: '_Tuple2',
					_0: _p34 + 1,
					_1: A3(func, _p34, x, _p33._1)
				};
			});
		return _elm_lang$core$Tuple$second(
			A3(
				_elm_lang$core$List$foldl,
				step,
				{ctor: '_Tuple2', _0: 0, _1: acc},
				list));
	});
var _elm_community$list_extra$List_Extra$foldr1 = F2(
	function (f, xs) {
		var mf = F2(
			function (x, m) {
				return _elm_lang$core$Maybe$Just(
					function () {
						var _p35 = m;
						if (_p35.ctor === 'Nothing') {
							return x;
						} else {
							return A2(f, x, _p35._0);
						}
					}());
			});
		return A3(_elm_lang$core$List$foldr, mf, _elm_lang$core$Maybe$Nothing, xs);
	});
var _elm_community$list_extra$List_Extra$foldl1 = F2(
	function (f, xs) {
		var mf = F2(
			function (x, m) {
				return _elm_lang$core$Maybe$Just(
					function () {
						var _p36 = m;
						if (_p36.ctor === 'Nothing') {
							return x;
						} else {
							return A2(f, _p36._0, x);
						}
					}());
			});
		return A3(_elm_lang$core$List$foldl, mf, _elm_lang$core$Maybe$Nothing, xs);
	});
var _elm_community$list_extra$List_Extra$interweaveHelp = F3(
	function (l1, l2, acc) {
		interweaveHelp:
		while (true) {
			var _p37 = {ctor: '_Tuple2', _0: l1, _1: l2};
			_v24_1:
			do {
				if (_p37._0.ctor === '::') {
					if (_p37._1.ctor === '::') {
						var _v25 = _p37._0._1,
							_v26 = _p37._1._1,
							_v27 = A2(
							_elm_lang$core$Basics_ops['++'],
							acc,
							{
								ctor: '::',
								_0: _p37._0._0,
								_1: {
									ctor: '::',
									_0: _p37._1._0,
									_1: {ctor: '[]'}
								}
							});
						l1 = _v25;
						l2 = _v26;
						acc = _v27;
						continue interweaveHelp;
					} else {
						break _v24_1;
					}
				} else {
					if (_p37._1.ctor === '[]') {
						break _v24_1;
					} else {
						return A2(_elm_lang$core$Basics_ops['++'], acc, _p37._1);
					}
				}
			} while(false);
			return A2(_elm_lang$core$Basics_ops['++'], acc, _p37._0);
		}
	});
var _elm_community$list_extra$List_Extra$interweave = F2(
	function (l1, l2) {
		return A3(
			_elm_community$list_extra$List_Extra$interweaveHelp,
			l1,
			l2,
			{ctor: '[]'});
	});
var _elm_community$list_extra$List_Extra$permutations = function (xs_) {
	var _p38 = xs_;
	if (_p38.ctor === '[]') {
		return {
			ctor: '::',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		};
	} else {
		var f = function (_p39) {
			var _p40 = _p39;
			return A2(
				_elm_lang$core$List$map,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					})(_p40._0),
				_elm_community$list_extra$List_Extra$permutations(_p40._1));
		};
		return A2(
			_elm_lang$core$List$concatMap,
			f,
			_elm_community$list_extra$List_Extra$select(_p38));
	}
};
var _elm_community$list_extra$List_Extra$isPermutationOf = F2(
	function (permut, xs) {
		return A2(
			_elm_lang$core$List$member,
			permut,
			_elm_community$list_extra$List_Extra$permutations(xs));
	});
var _elm_community$list_extra$List_Extra$subsequencesNonEmpty = function (xs) {
	var _p41 = xs;
	if (_p41.ctor === '[]') {
		return {ctor: '[]'};
	} else {
		var _p42 = _p41._0;
		var f = F2(
			function (ys, r) {
				return {
					ctor: '::',
					_0: ys,
					_1: {
						ctor: '::',
						_0: {ctor: '::', _0: _p42, _1: ys},
						_1: r
					}
				};
			});
		return {
			ctor: '::',
			_0: {
				ctor: '::',
				_0: _p42,
				_1: {ctor: '[]'}
			},
			_1: A3(
				_elm_lang$core$List$foldr,
				f,
				{ctor: '[]'},
				_elm_community$list_extra$List_Extra$subsequencesNonEmpty(_p41._1))
		};
	}
};
var _elm_community$list_extra$List_Extra$subsequences = function (xs) {
	return {
		ctor: '::',
		_0: {ctor: '[]'},
		_1: _elm_community$list_extra$List_Extra$subsequencesNonEmpty(xs)
	};
};
var _elm_community$list_extra$List_Extra$isSubsequenceOf = F2(
	function (subseq, xs) {
		return A2(
			_elm_lang$core$List$member,
			subseq,
			_elm_community$list_extra$List_Extra$subsequences(xs));
	});
var _elm_community$list_extra$List_Extra$transpose = function (ll) {
	transpose:
	while (true) {
		var _p43 = ll;
		if (_p43.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			if (_p43._0.ctor === '[]') {
				var _v32 = _p43._1;
				ll = _v32;
				continue transpose;
			} else {
				var _p44 = _p43._1;
				var tails = A2(_elm_lang$core$List$filterMap, _elm_lang$core$List$tail, _p44);
				var heads = A2(_elm_lang$core$List$filterMap, _elm_lang$core$List$head, _p44);
				return {
					ctor: '::',
					_0: {ctor: '::', _0: _p43._0._0, _1: heads},
					_1: _elm_community$list_extra$List_Extra$transpose(
						{ctor: '::', _0: _p43._0._1, _1: tails})
				};
			}
		}
	}
};
var _elm_community$list_extra$List_Extra$intercalate = function (xs) {
	return function (_p45) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$intersperse, xs, _p45));
	};
};
var _elm_community$list_extra$List_Extra$filterNot = F2(
	function (pred, list) {
		return A2(
			_elm_lang$core$List$filter,
			function (_p46) {
				return !pred(_p46);
			},
			list);
	});
var _elm_community$list_extra$List_Extra$removeAt = F2(
	function (index, l) {
		if (_elm_lang$core$Native_Utils.cmp(index, 0) < 0) {
			return l;
		} else {
			var tail = _elm_lang$core$List$tail(
				A2(_elm_lang$core$List$drop, index, l));
			var head = A2(_elm_lang$core$List$take, index, l);
			var _p47 = tail;
			if (_p47.ctor === 'Nothing') {
				return l;
			} else {
				return A2(_elm_lang$core$List$append, head, _p47._0);
			}
		}
	});
var _elm_community$list_extra$List_Extra$stableSortWith = F2(
	function (pred, list) {
		var predWithIndex = F2(
			function (_p49, _p48) {
				var _p50 = _p49;
				var _p51 = _p48;
				var result = A2(pred, _p50._0, _p51._0);
				var _p52 = result;
				if (_p52.ctor === 'EQ') {
					return A2(_elm_lang$core$Basics$compare, _p50._1, _p51._1);
				} else {
					return result;
				}
			});
		var listWithIndex = A2(
			_elm_lang$core$List$indexedMap,
			F2(
				function (i, a) {
					return {ctor: '_Tuple2', _0: a, _1: i};
				}),
			list);
		return A2(
			_elm_lang$core$List$map,
			_elm_lang$core$Tuple$first,
			A2(_elm_lang$core$List$sortWith, predWithIndex, listWithIndex));
	});
var _elm_community$list_extra$List_Extra$setAt = F3(
	function (index, value, l) {
		if (_elm_lang$core$Native_Utils.cmp(index, 0) < 0) {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			var tail = _elm_lang$core$List$tail(
				A2(_elm_lang$core$List$drop, index, l));
			var head = A2(_elm_lang$core$List$take, index, l);
			var _p53 = tail;
			if (_p53.ctor === 'Nothing') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				return _elm_lang$core$Maybe$Just(
					A2(
						_elm_lang$core$List$append,
						head,
						{ctor: '::', _0: value, _1: _p53._0}));
			}
		}
	});
var _elm_community$list_extra$List_Extra$remove = F2(
	function (x, xs) {
		var _p54 = xs;
		if (_p54.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var _p56 = _p54._1;
			var _p55 = _p54._0;
			return _elm_lang$core$Native_Utils.eq(x, _p55) ? _p56 : {
				ctor: '::',
				_0: _p55,
				_1: A2(_elm_community$list_extra$List_Extra$remove, x, _p56)
			};
		}
	});
var _elm_community$list_extra$List_Extra$updateIfIndex = F3(
	function (predicate, update, list) {
		return A2(
			_elm_lang$core$List$indexedMap,
			F2(
				function (i, x) {
					return predicate(i) ? update(x) : x;
				}),
			list);
	});
var _elm_community$list_extra$List_Extra$updateAt = F3(
	function (index, update, list) {
		return ((_elm_lang$core$Native_Utils.cmp(index, 0) < 0) || (_elm_lang$core$Native_Utils.cmp(
			index,
			_elm_lang$core$List$length(list)) > -1)) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
			A3(
				_elm_community$list_extra$List_Extra$updateIfIndex,
				F2(
					function (x, y) {
						return _elm_lang$core$Native_Utils.eq(x, y);
					})(index),
				update,
				list));
	});
var _elm_community$list_extra$List_Extra$updateIf = F3(
	function (predicate, update, list) {
		return A2(
			_elm_lang$core$List$map,
			function (item) {
				return predicate(item) ? update(item) : item;
			},
			list);
	});
var _elm_community$list_extra$List_Extra$replaceIf = F3(
	function (predicate, replacement, list) {
		return A3(
			_elm_community$list_extra$List_Extra$updateIf,
			predicate,
			_elm_lang$core$Basics$always(replacement),
			list);
	});
var _elm_community$list_extra$List_Extra$findIndices = function (p) {
	return function (_p57) {
		return A2(
			_elm_lang$core$List$map,
			_elm_lang$core$Tuple$first,
			A2(
				_elm_lang$core$List$filter,
				function (_p58) {
					var _p59 = _p58;
					return p(_p59._1);
				},
				A2(
					_elm_lang$core$List$indexedMap,
					F2(
						function (v0, v1) {
							return {ctor: '_Tuple2', _0: v0, _1: v1};
						}),
					_p57)));
	};
};
var _elm_community$list_extra$List_Extra$findIndex = function (p) {
	return function (_p60) {
		return _elm_lang$core$List$head(
			A2(_elm_community$list_extra$List_Extra$findIndices, p, _p60));
	};
};
var _elm_community$list_extra$List_Extra$splitWhen = F2(
	function (predicate, list) {
		return A2(
			_elm_lang$core$Maybe$map,
			function (i) {
				return A2(_elm_community$list_extra$List_Extra$splitAt, i, list);
			},
			A2(_elm_community$list_extra$List_Extra$findIndex, predicate, list));
	});
var _elm_community$list_extra$List_Extra$elemIndices = function (x) {
	return _elm_community$list_extra$List_Extra$findIndices(
		F2(
			function (x, y) {
				return _elm_lang$core$Native_Utils.eq(x, y);
			})(x));
};
var _elm_community$list_extra$List_Extra$elemIndex = function (x) {
	return _elm_community$list_extra$List_Extra$findIndex(
		F2(
			function (x, y) {
				return _elm_lang$core$Native_Utils.eq(x, y);
			})(x));
};
var _elm_community$list_extra$List_Extra$find = F2(
	function (predicate, list) {
		find:
		while (true) {
			var _p61 = list;
			if (_p61.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p62 = _p61._0;
				if (predicate(_p62)) {
					return _elm_lang$core$Maybe$Just(_p62);
				} else {
					var _v41 = predicate,
						_v42 = _p61._1;
					predicate = _v41;
					list = _v42;
					continue find;
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$notMember = function (x) {
	return function (_p63) {
		return !A2(_elm_lang$core$List$member, x, _p63);
	};
};
var _elm_community$list_extra$List_Extra$andThen = _elm_lang$core$List$concatMap;
var _elm_community$list_extra$List_Extra$lift2 = F3(
	function (f, la, lb) {
		return A2(
			_elm_community$list_extra$List_Extra$andThen,
			function (a) {
				return A2(
					_elm_community$list_extra$List_Extra$andThen,
					function (b) {
						return {
							ctor: '::',
							_0: A2(f, a, b),
							_1: {ctor: '[]'}
						};
					},
					lb);
			},
			la);
	});
var _elm_community$list_extra$List_Extra$lift3 = F4(
	function (f, la, lb, lc) {
		return A2(
			_elm_community$list_extra$List_Extra$andThen,
			function (a) {
				return A2(
					_elm_community$list_extra$List_Extra$andThen,
					function (b) {
						return A2(
							_elm_community$list_extra$List_Extra$andThen,
							function (c) {
								return {
									ctor: '::',
									_0: A3(f, a, b, c),
									_1: {ctor: '[]'}
								};
							},
							lc);
					},
					lb);
			},
			la);
	});
var _elm_community$list_extra$List_Extra$lift4 = F5(
	function (f, la, lb, lc, ld) {
		return A2(
			_elm_community$list_extra$List_Extra$andThen,
			function (a) {
				return A2(
					_elm_community$list_extra$List_Extra$andThen,
					function (b) {
						return A2(
							_elm_community$list_extra$List_Extra$andThen,
							function (c) {
								return A2(
									_elm_community$list_extra$List_Extra$andThen,
									function (d) {
										return {
											ctor: '::',
											_0: A4(f, a, b, c, d),
											_1: {ctor: '[]'}
										};
									},
									ld);
							},
							lc);
					},
					lb);
			},
			la);
	});
var _elm_community$list_extra$List_Extra$andMap = F2(
	function (l, fl) {
		return A3(
			_elm_lang$core$List$map2,
			F2(
				function (x, y) {
					return x(y);
				}),
			fl,
			l);
	});
var _elm_community$list_extra$List_Extra$uniqueHelp = F3(
	function (f, existing, remaining) {
		uniqueHelp:
		while (true) {
			var _p64 = remaining;
			if (_p64.ctor === '[]') {
				return {ctor: '[]'};
			} else {
				var _p66 = _p64._1;
				var _p65 = _p64._0;
				var computedFirst = f(_p65);
				if (A2(_elm_lang$core$Set$member, computedFirst, existing)) {
					var _v44 = f,
						_v45 = existing,
						_v46 = _p66;
					f = _v44;
					existing = _v45;
					remaining = _v46;
					continue uniqueHelp;
				} else {
					return {
						ctor: '::',
						_0: _p65,
						_1: A3(
							_elm_community$list_extra$List_Extra$uniqueHelp,
							f,
							A2(_elm_lang$core$Set$insert, computedFirst, existing),
							_p66)
					};
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$uniqueBy = F2(
	function (f, list) {
		return A3(_elm_community$list_extra$List_Extra$uniqueHelp, f, _elm_lang$core$Set$empty, list);
	});
var _elm_community$list_extra$List_Extra$allDifferentBy = F2(
	function (f, list) {
		return _elm_lang$core$Native_Utils.eq(
			_elm_lang$core$List$length(list),
			_elm_lang$core$List$length(
				A2(_elm_community$list_extra$List_Extra$uniqueBy, f, list)));
	});
var _elm_community$list_extra$List_Extra$allDifferent = function (list) {
	return A2(_elm_community$list_extra$List_Extra$allDifferentBy, _elm_lang$core$Basics$identity, list);
};
var _elm_community$list_extra$List_Extra$unique = function (list) {
	return A3(_elm_community$list_extra$List_Extra$uniqueHelp, _elm_lang$core$Basics$identity, _elm_lang$core$Set$empty, list);
};
var _elm_community$list_extra$List_Extra$dropWhile = F2(
	function (predicate, list) {
		dropWhile:
		while (true) {
			var _p67 = list;
			if (_p67.ctor === '[]') {
				return {ctor: '[]'};
			} else {
				if (predicate(_p67._0)) {
					var _v48 = predicate,
						_v49 = _p67._1;
					predicate = _v48;
					list = _v49;
					continue dropWhile;
				} else {
					return list;
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$takeWhile = function (predicate) {
	var takeWhileMemo = F2(
		function (memo, list) {
			takeWhileMemo:
			while (true) {
				var _p68 = list;
				if (_p68.ctor === '[]') {
					return _elm_lang$core$List$reverse(memo);
				} else {
					var _p69 = _p68._0;
					if (predicate(_p69)) {
						var _v51 = {ctor: '::', _0: _p69, _1: memo},
							_v52 = _p68._1;
						memo = _v51;
						list = _v52;
						continue takeWhileMemo;
					} else {
						return _elm_lang$core$List$reverse(memo);
					}
				}
			}
		});
	return takeWhileMemo(
		{ctor: '[]'});
};
var _elm_community$list_extra$List_Extra$span = F2(
	function (p, xs) {
		return {
			ctor: '_Tuple2',
			_0: A2(_elm_community$list_extra$List_Extra$takeWhile, p, xs),
			_1: A2(_elm_community$list_extra$List_Extra$dropWhile, p, xs)
		};
	});
var _elm_community$list_extra$List_Extra$break = function (p) {
	return _elm_community$list_extra$List_Extra$span(
		function (_p70) {
			return !p(_p70);
		});
};
var _elm_community$list_extra$List_Extra$groupWhile = F2(
	function (eq, xs_) {
		var _p71 = xs_;
		if (_p71.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var _p73 = _p71._0;
			var _p72 = A2(
				_elm_community$list_extra$List_Extra$span,
				eq(_p73),
				_p71._1);
			var ys = _p72._0;
			var zs = _p72._1;
			return {
				ctor: '::',
				_0: {ctor: '::', _0: _p73, _1: ys},
				_1: A2(_elm_community$list_extra$List_Extra$groupWhile, eq, zs)
			};
		}
	});
var _elm_community$list_extra$List_Extra$group = _elm_community$list_extra$List_Extra$groupWhile(
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.eq(x, y);
		}));
var _elm_community$list_extra$List_Extra$minimumBy = F2(
	function (f, ls) {
		var minBy = F2(
			function (x, _p74) {
				var _p75 = _p74;
				var _p76 = _p75._1;
				var fx = f(x);
				return (_elm_lang$core$Native_Utils.cmp(fx, _p76) < 0) ? {ctor: '_Tuple2', _0: x, _1: fx} : {ctor: '_Tuple2', _0: _p75._0, _1: _p76};
			});
		var _p77 = ls;
		if (_p77.ctor === '::') {
			if (_p77._1.ctor === '[]') {
				return _elm_lang$core$Maybe$Just(_p77._0);
			} else {
				var _p78 = _p77._0;
				return _elm_lang$core$Maybe$Just(
					_elm_lang$core$Tuple$first(
						A3(
							_elm_lang$core$List$foldl,
							minBy,
							{
								ctor: '_Tuple2',
								_0: _p78,
								_1: f(_p78)
							},
							_p77._1)));
			}
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_community$list_extra$List_Extra$maximumBy = F2(
	function (f, ls) {
		var maxBy = F2(
			function (x, _p79) {
				var _p80 = _p79;
				var _p81 = _p80._1;
				var fx = f(x);
				return (_elm_lang$core$Native_Utils.cmp(fx, _p81) > 0) ? {ctor: '_Tuple2', _0: x, _1: fx} : {ctor: '_Tuple2', _0: _p80._0, _1: _p81};
			});
		var _p82 = ls;
		if (_p82.ctor === '::') {
			if (_p82._1.ctor === '[]') {
				return _elm_lang$core$Maybe$Just(_p82._0);
			} else {
				var _p83 = _p82._0;
				return _elm_lang$core$Maybe$Just(
					_elm_lang$core$Tuple$first(
						A3(
							_elm_lang$core$List$foldl,
							maxBy,
							{
								ctor: '_Tuple2',
								_0: _p83,
								_1: f(_p83)
							},
							_p82._1)));
			}
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_community$list_extra$List_Extra$uncons = function (xs) {
	var _p84 = xs;
	if (_p84.ctor === '[]') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		return _elm_lang$core$Maybe$Just(
			{ctor: '_Tuple2', _0: _p84._0, _1: _p84._1});
	}
};
var _elm_community$list_extra$List_Extra$swapAt = F3(
	function (index1, index2, l) {
		swapAt:
		while (true) {
			if (_elm_lang$core$Native_Utils.eq(index1, index2)) {
				return _elm_lang$core$Maybe$Just(l);
			} else {
				if (_elm_lang$core$Native_Utils.cmp(index1, index2) > 0) {
					var _v59 = index2,
						_v60 = index1,
						_v61 = l;
					index1 = _v59;
					index2 = _v60;
					l = _v61;
					continue swapAt;
				} else {
					if (_elm_lang$core$Native_Utils.cmp(index1, 0) < 0) {
						return _elm_lang$core$Maybe$Nothing;
					} else {
						var _p85 = A2(_elm_community$list_extra$List_Extra$splitAt, index1, l);
						var part1 = _p85._0;
						var tail1 = _p85._1;
						var _p86 = A2(_elm_community$list_extra$List_Extra$splitAt, index2 - index1, tail1);
						var head2 = _p86._0;
						var tail2 = _p86._1;
						return A3(
							_elm_lang$core$Maybe$map2,
							F2(
								function (_p88, _p87) {
									var _p89 = _p88;
									var _p90 = _p87;
									return _elm_lang$core$List$concat(
										{
											ctor: '::',
											_0: part1,
											_1: {
												ctor: '::',
												_0: {ctor: '::', _0: _p90._0, _1: _p89._1},
												_1: {
													ctor: '::',
													_0: {ctor: '::', _0: _p89._0, _1: _p90._1},
													_1: {ctor: '[]'}
												}
											}
										});
								}),
							_elm_community$list_extra$List_Extra$uncons(head2),
							_elm_community$list_extra$List_Extra$uncons(tail2));
					}
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$iterate = F2(
	function (f, x) {
		var _p91 = f(x);
		if (_p91.ctor === 'Just') {
			return {
				ctor: '::',
				_0: x,
				_1: A2(_elm_community$list_extra$List_Extra$iterate, f, _p91._0)
			};
		} else {
			return {
				ctor: '::',
				_0: x,
				_1: {ctor: '[]'}
			};
		}
	});
var _elm_community$list_extra$List_Extra$getAt = F2(
	function (idx, xs) {
		return (_elm_lang$core$Native_Utils.cmp(idx, 0) < 0) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$List$head(
			A2(_elm_lang$core$List$drop, idx, xs));
	});
var _elm_community$list_extra$List_Extra_ops = _elm_community$list_extra$List_Extra_ops || {};
_elm_community$list_extra$List_Extra_ops['!!'] = _elm_lang$core$Basics$flip(_elm_community$list_extra$List_Extra$getAt);
var _elm_community$list_extra$List_Extra$init = function () {
	var maybe = F2(
		function (d, f) {
			return function (_p92) {
				return A2(
					_elm_lang$core$Maybe$withDefault,
					d,
					A2(_elm_lang$core$Maybe$map, f, _p92));
			};
		});
	return A2(
		_elm_lang$core$List$foldr,
		function (x) {
			return function (_p93) {
				return _elm_lang$core$Maybe$Just(
					A3(
						maybe,
						{ctor: '[]'},
						F2(
							function (x, y) {
								return {ctor: '::', _0: x, _1: y};
							})(x),
						_p93));
			};
		},
		_elm_lang$core$Maybe$Nothing);
}();
var _elm_community$list_extra$List_Extra$last = _elm_community$list_extra$List_Extra$foldl1(
	_elm_lang$core$Basics$flip(_elm_lang$core$Basics$always));

var _elm_lang$core$Color$fmod = F2(
	function (f, n) {
		var integer = _elm_lang$core$Basics$floor(f);
		return (_elm_lang$core$Basics$toFloat(
			A2(_elm_lang$core$Basics_ops['%'], integer, n)) + f) - _elm_lang$core$Basics$toFloat(integer);
	});
var _elm_lang$core$Color$rgbToHsl = F3(
	function (red, green, blue) {
		var b = _elm_lang$core$Basics$toFloat(blue) / 255;
		var g = _elm_lang$core$Basics$toFloat(green) / 255;
		var r = _elm_lang$core$Basics$toFloat(red) / 255;
		var cMax = A2(
			_elm_lang$core$Basics$max,
			A2(_elm_lang$core$Basics$max, r, g),
			b);
		var cMin = A2(
			_elm_lang$core$Basics$min,
			A2(_elm_lang$core$Basics$min, r, g),
			b);
		var c = cMax - cMin;
		var lightness = (cMax + cMin) / 2;
		var saturation = _elm_lang$core$Native_Utils.eq(lightness, 0) ? 0 : (c / (1 - _elm_lang$core$Basics$abs((2 * lightness) - 1)));
		var hue = _elm_lang$core$Basics$degrees(60) * (_elm_lang$core$Native_Utils.eq(cMax, r) ? A2(_elm_lang$core$Color$fmod, (g - b) / c, 6) : (_elm_lang$core$Native_Utils.eq(cMax, g) ? (((b - r) / c) + 2) : (((r - g) / c) + 4)));
		return {ctor: '_Tuple3', _0: hue, _1: saturation, _2: lightness};
	});
var _elm_lang$core$Color$hslToRgb = F3(
	function (hue, saturation, lightness) {
		var normHue = hue / _elm_lang$core$Basics$degrees(60);
		var chroma = (1 - _elm_lang$core$Basics$abs((2 * lightness) - 1)) * saturation;
		var x = chroma * (1 - _elm_lang$core$Basics$abs(
			A2(_elm_lang$core$Color$fmod, normHue, 2) - 1));
		var _p0 = (_elm_lang$core$Native_Utils.cmp(normHue, 0) < 0) ? {ctor: '_Tuple3', _0: 0, _1: 0, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 1) < 0) ? {ctor: '_Tuple3', _0: chroma, _1: x, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 2) < 0) ? {ctor: '_Tuple3', _0: x, _1: chroma, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 3) < 0) ? {ctor: '_Tuple3', _0: 0, _1: chroma, _2: x} : ((_elm_lang$core$Native_Utils.cmp(normHue, 4) < 0) ? {ctor: '_Tuple3', _0: 0, _1: x, _2: chroma} : ((_elm_lang$core$Native_Utils.cmp(normHue, 5) < 0) ? {ctor: '_Tuple3', _0: x, _1: 0, _2: chroma} : ((_elm_lang$core$Native_Utils.cmp(normHue, 6) < 0) ? {ctor: '_Tuple3', _0: chroma, _1: 0, _2: x} : {ctor: '_Tuple3', _0: 0, _1: 0, _2: 0}))))));
		var r = _p0._0;
		var g = _p0._1;
		var b = _p0._2;
		var m = lightness - (chroma / 2);
		return {ctor: '_Tuple3', _0: r + m, _1: g + m, _2: b + m};
	});
var _elm_lang$core$Color$toRgb = function (color) {
	var _p1 = color;
	if (_p1.ctor === 'RGBA') {
		return {red: _p1._0, green: _p1._1, blue: _p1._2, alpha: _p1._3};
	} else {
		var _p2 = A3(_elm_lang$core$Color$hslToRgb, _p1._0, _p1._1, _p1._2);
		var r = _p2._0;
		var g = _p2._1;
		var b = _p2._2;
		return {
			red: _elm_lang$core$Basics$round(255 * r),
			green: _elm_lang$core$Basics$round(255 * g),
			blue: _elm_lang$core$Basics$round(255 * b),
			alpha: _p1._3
		};
	}
};
var _elm_lang$core$Color$toHsl = function (color) {
	var _p3 = color;
	if (_p3.ctor === 'HSLA') {
		return {hue: _p3._0, saturation: _p3._1, lightness: _p3._2, alpha: _p3._3};
	} else {
		var _p4 = A3(_elm_lang$core$Color$rgbToHsl, _p3._0, _p3._1, _p3._2);
		var h = _p4._0;
		var s = _p4._1;
		var l = _p4._2;
		return {hue: h, saturation: s, lightness: l, alpha: _p3._3};
	}
};
var _elm_lang$core$Color$HSLA = F4(
	function (a, b, c, d) {
		return {ctor: 'HSLA', _0: a, _1: b, _2: c, _3: d};
	});
var _elm_lang$core$Color$hsla = F4(
	function (hue, saturation, lightness, alpha) {
		return A4(
			_elm_lang$core$Color$HSLA,
			hue - _elm_lang$core$Basics$turns(
				_elm_lang$core$Basics$toFloat(
					_elm_lang$core$Basics$floor(hue / (2 * _elm_lang$core$Basics$pi)))),
			saturation,
			lightness,
			alpha);
	});
var _elm_lang$core$Color$hsl = F3(
	function (hue, saturation, lightness) {
		return A4(_elm_lang$core$Color$hsla, hue, saturation, lightness, 1);
	});
var _elm_lang$core$Color$complement = function (color) {
	var _p5 = color;
	if (_p5.ctor === 'HSLA') {
		return A4(
			_elm_lang$core$Color$hsla,
			_p5._0 + _elm_lang$core$Basics$degrees(180),
			_p5._1,
			_p5._2,
			_p5._3);
	} else {
		var _p6 = A3(_elm_lang$core$Color$rgbToHsl, _p5._0, _p5._1, _p5._2);
		var h = _p6._0;
		var s = _p6._1;
		var l = _p6._2;
		return A4(
			_elm_lang$core$Color$hsla,
			h + _elm_lang$core$Basics$degrees(180),
			s,
			l,
			_p5._3);
	}
};
var _elm_lang$core$Color$grayscale = function (p) {
	return A4(_elm_lang$core$Color$HSLA, 0, 0, 1 - p, 1);
};
var _elm_lang$core$Color$greyscale = function (p) {
	return A4(_elm_lang$core$Color$HSLA, 0, 0, 1 - p, 1);
};
var _elm_lang$core$Color$RGBA = F4(
	function (a, b, c, d) {
		return {ctor: 'RGBA', _0: a, _1: b, _2: c, _3: d};
	});
var _elm_lang$core$Color$rgba = _elm_lang$core$Color$RGBA;
var _elm_lang$core$Color$rgb = F3(
	function (r, g, b) {
		return A4(_elm_lang$core$Color$RGBA, r, g, b, 1);
	});
var _elm_lang$core$Color$lightRed = A4(_elm_lang$core$Color$RGBA, 239, 41, 41, 1);
var _elm_lang$core$Color$red = A4(_elm_lang$core$Color$RGBA, 204, 0, 0, 1);
var _elm_lang$core$Color$darkRed = A4(_elm_lang$core$Color$RGBA, 164, 0, 0, 1);
var _elm_lang$core$Color$lightOrange = A4(_elm_lang$core$Color$RGBA, 252, 175, 62, 1);
var _elm_lang$core$Color$orange = A4(_elm_lang$core$Color$RGBA, 245, 121, 0, 1);
var _elm_lang$core$Color$darkOrange = A4(_elm_lang$core$Color$RGBA, 206, 92, 0, 1);
var _elm_lang$core$Color$lightYellow = A4(_elm_lang$core$Color$RGBA, 255, 233, 79, 1);
var _elm_lang$core$Color$yellow = A4(_elm_lang$core$Color$RGBA, 237, 212, 0, 1);
var _elm_lang$core$Color$darkYellow = A4(_elm_lang$core$Color$RGBA, 196, 160, 0, 1);
var _elm_lang$core$Color$lightGreen = A4(_elm_lang$core$Color$RGBA, 138, 226, 52, 1);
var _elm_lang$core$Color$green = A4(_elm_lang$core$Color$RGBA, 115, 210, 22, 1);
var _elm_lang$core$Color$darkGreen = A4(_elm_lang$core$Color$RGBA, 78, 154, 6, 1);
var _elm_lang$core$Color$lightBlue = A4(_elm_lang$core$Color$RGBA, 114, 159, 207, 1);
var _elm_lang$core$Color$blue = A4(_elm_lang$core$Color$RGBA, 52, 101, 164, 1);
var _elm_lang$core$Color$darkBlue = A4(_elm_lang$core$Color$RGBA, 32, 74, 135, 1);
var _elm_lang$core$Color$lightPurple = A4(_elm_lang$core$Color$RGBA, 173, 127, 168, 1);
var _elm_lang$core$Color$purple = A4(_elm_lang$core$Color$RGBA, 117, 80, 123, 1);
var _elm_lang$core$Color$darkPurple = A4(_elm_lang$core$Color$RGBA, 92, 53, 102, 1);
var _elm_lang$core$Color$lightBrown = A4(_elm_lang$core$Color$RGBA, 233, 185, 110, 1);
var _elm_lang$core$Color$brown = A4(_elm_lang$core$Color$RGBA, 193, 125, 17, 1);
var _elm_lang$core$Color$darkBrown = A4(_elm_lang$core$Color$RGBA, 143, 89, 2, 1);
var _elm_lang$core$Color$black = A4(_elm_lang$core$Color$RGBA, 0, 0, 0, 1);
var _elm_lang$core$Color$white = A4(_elm_lang$core$Color$RGBA, 255, 255, 255, 1);
var _elm_lang$core$Color$lightGrey = A4(_elm_lang$core$Color$RGBA, 238, 238, 236, 1);
var _elm_lang$core$Color$grey = A4(_elm_lang$core$Color$RGBA, 211, 215, 207, 1);
var _elm_lang$core$Color$darkGrey = A4(_elm_lang$core$Color$RGBA, 186, 189, 182, 1);
var _elm_lang$core$Color$lightGray = A4(_elm_lang$core$Color$RGBA, 238, 238, 236, 1);
var _elm_lang$core$Color$gray = A4(_elm_lang$core$Color$RGBA, 211, 215, 207, 1);
var _elm_lang$core$Color$darkGray = A4(_elm_lang$core$Color$RGBA, 186, 189, 182, 1);
var _elm_lang$core$Color$lightCharcoal = A4(_elm_lang$core$Color$RGBA, 136, 138, 133, 1);
var _elm_lang$core$Color$charcoal = A4(_elm_lang$core$Color$RGBA, 85, 87, 83, 1);
var _elm_lang$core$Color$darkCharcoal = A4(_elm_lang$core$Color$RGBA, 46, 52, 54, 1);
var _elm_lang$core$Color$Radial = F5(
	function (a, b, c, d, e) {
		return {ctor: 'Radial', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Color$radial = _elm_lang$core$Color$Radial;
var _elm_lang$core$Color$Linear = F3(
	function (a, b, c) {
		return {ctor: 'Linear', _0: a, _1: b, _2: c};
	});
var _elm_lang$core$Color$linear = _elm_lang$core$Color$Linear;

var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Maybe, Native.List //

var _elm_lang$core$Native_Regex = function() {

function escape(str)
{
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
function caseInsensitive(re)
{
	return new RegExp(re.source, 'gi');
}
function regex(raw)
{
	return new RegExp(raw, 'g');
}

function contains(re, string)
{
	return string.match(re) !== null;
}

function find(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var out = [];
	var number = 0;
	var string = str;
	var lastIndex = re.lastIndex;
	var prevLastIndex = -1;
	var result;
	while (number++ < n && (result = re.exec(string)))
	{
		if (prevLastIndex === re.lastIndex) break;
		var i = result.length - 1;
		var subs = new Array(i);
		while (i > 0)
		{
			var submatch = result[i];
			subs[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		out.push({
			match: result[0],
			submatches: _elm_lang$core$Native_List.fromArray(subs),
			index: result.index,
			number: number
		});
		prevLastIndex = re.lastIndex;
	}
	re.lastIndex = lastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

function replace(n, re, replacer, string)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var count = 0;
	function jsReplacer(match)
	{
		if (count++ >= n)
		{
			return match;
		}
		var i = arguments.length - 3;
		var submatches = new Array(i);
		while (i > 0)
		{
			var submatch = arguments[i];
			submatches[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		return replacer({
			match: match,
			submatches: _elm_lang$core$Native_List.fromArray(submatches),
			index: arguments[arguments.length - 2],
			number: count
		});
	}
	return string.replace(re, jsReplacer);
}

function split(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	if (n === Infinity)
	{
		return _elm_lang$core$Native_List.fromArray(str.split(re));
	}
	var string = str;
	var result;
	var out = [];
	var start = re.lastIndex;
	var restoreLastIndex = re.lastIndex;
	while (n--)
	{
		if (!(result = re.exec(string))) break;
		out.push(string.slice(start, result.index));
		start = re.lastIndex;
	}
	out.push(string.slice(start));
	re.lastIndex = restoreLastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

return {
	regex: regex,
	caseInsensitive: caseInsensitive,
	escape: escape,

	contains: F2(contains),
	find: F3(find),
	replace: F4(replace),
	split: F3(split)
};

}();

var _elm_lang$core$Regex$split = _elm_lang$core$Native_Regex.split;
var _elm_lang$core$Regex$replace = _elm_lang$core$Native_Regex.replace;
var _elm_lang$core$Regex$find = _elm_lang$core$Native_Regex.find;
var _elm_lang$core$Regex$contains = _elm_lang$core$Native_Regex.contains;
var _elm_lang$core$Regex$caseInsensitive = _elm_lang$core$Native_Regex.caseInsensitive;
var _elm_lang$core$Regex$regex = _elm_lang$core$Native_Regex.regex;
var _elm_lang$core$Regex$escape = _elm_lang$core$Native_Regex.escape;
var _elm_lang$core$Regex$Match = F4(
	function (a, b, c, d) {
		return {match: a, submatches: b, index: c, number: d};
	});
var _elm_lang$core$Regex$Regex = {ctor: 'Regex'};
var _elm_lang$core$Regex$AtMost = function (a) {
	return {ctor: 'AtMost', _0: a};
};
var _elm_lang$core$Regex$All = {ctor: 'All'};

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

var _elm_lang$virtual_dom$Native_Debug = function() {


// IMPORT / EXPORT

function unsafeCoerce(value)
{
	return value;
}

var upload = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	var element = document.createElement('input');
	element.setAttribute('type', 'file');
	element.setAttribute('accept', 'text/json');
	element.style.display = 'none';
	element.addEventListener('change', function(event)
	{
		var fileReader = new FileReader();
		fileReader.onload = function(e)
		{
			callback(_elm_lang$core$Native_Scheduler.succeed(e.target.result));
		};
		fileReader.readAsText(event.target.files[0]);
		document.body.removeChild(element);
	});
	document.body.appendChild(element);
	element.click();
});

function download(historyLength, json)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var fileName = 'history-' + historyLength + '.txt';
		var jsonString = JSON.stringify(json);
		var mime = 'text/plain;charset=utf-8';
		var done = _elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0);

		// for IE10+
		if (navigator.msSaveBlob)
		{
			navigator.msSaveBlob(new Blob([jsonString], {type: mime}), fileName);
			return callback(done);
		}

		// for HTML5
		var element = document.createElement('a');
		element.setAttribute('href', 'data:' + mime + ',' + encodeURIComponent(jsonString));
		element.setAttribute('download', fileName);
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		callback(done);
	});
}


// POPOUT

function messageToString(value)
{
	switch (typeof value)
	{
		case 'boolean':
			return value ? 'True' : 'False';
		case 'number':
			return value + '';
		case 'string':
			return '"' + addSlashes(value, false) + '"';
	}
	if (value instanceof String)
	{
		return '\'' + addSlashes(value, true) + '\'';
	}
	if (typeof value !== 'object' || value === null || !('ctor' in value))
	{
		return '…';
	}

	var ctorStarter = value.ctor.substring(0, 5);
	if (ctorStarter === '_Tupl' || ctorStarter === '_Task')
	{
		return '…'
	}
	if (['_Array', '<decoder>', '_Process', '::', '[]', 'Set_elm_builtin', 'RBNode_elm_builtin', 'RBEmpty_elm_builtin'].indexOf(value.ctor) >= 0)
	{
		return '…';
	}

	var keys = Object.keys(value);
	switch (keys.length)
	{
		case 1:
			return value.ctor;
		case 2:
			return value.ctor + ' ' + messageToString(value._0);
		default:
			return value.ctor + ' … ' + messageToString(value[keys[keys.length - 1]]);
	}
}


function primitive(str)
{
	return { ctor: 'Primitive', _0: str };
}


function init(value)
{
	var type = typeof value;

	if (type === 'boolean')
	{
		return {
			ctor: 'Constructor',
			_0: _elm_lang$core$Maybe$Just(value ? 'True' : 'False'),
			_1: true,
			_2: _elm_lang$core$Native_List.Nil
		};
	}

	if (type === 'number')
	{
		return primitive(value + '');
	}

	if (type === 'string')
	{
		return { ctor: 'S', _0: '"' + addSlashes(value, false) + '"' };
	}

	if (value instanceof String)
	{
		return { ctor: 'S', _0: "'" + addSlashes(value, true) + "'" };
	}

	if (value instanceof Date)
	{
		return primitive('<' + value.toString() + '>');
	}

	if (value === null)
	{
		return primitive('XXX');
	}

	if (type === 'object' && 'ctor' in value)
	{
		var ctor = value.ctor;

		if (ctor === '::' || ctor === '[]')
		{
			return {
				ctor: 'Sequence',
				_0: {ctor: 'ListSeq'},
				_1: true,
				_2: A2(_elm_lang$core$List$map, init, value)
			};
		}

		if (ctor === 'Set_elm_builtin')
		{
			return {
				ctor: 'Sequence',
				_0: {ctor: 'SetSeq'},
				_1: true,
				_2: A3(_elm_lang$core$Set$foldr, initCons, _elm_lang$core$Native_List.Nil, value)
			};
		}

		if (ctor === 'RBNode_elm_builtin' || ctor == 'RBEmpty_elm_builtin')
		{
			return {
				ctor: 'Dictionary',
				_0: true,
				_1: A3(_elm_lang$core$Dict$foldr, initKeyValueCons, _elm_lang$core$Native_List.Nil, value)
			};
		}

		if (ctor === '_Array')
		{
			return {
				ctor: 'Sequence',
				_0: {ctor: 'ArraySeq'},
				_1: true,
				_2: A3(_elm_lang$core$Array$foldr, initCons, _elm_lang$core$Native_List.Nil, value)
			};
		}

		var ctorStarter = value.ctor.substring(0, 5);
		if (ctorStarter === '_Task')
		{
			return primitive('<task>');
		}

		if (ctor === '<decoder>')
		{
			return primitive(ctor);
		}

		if (ctor === '_Process')
		{
			return primitive('<process>');
		}

		var list = _elm_lang$core$Native_List.Nil;
		for (var i in value)
		{
			if (i === 'ctor') continue;
			list = _elm_lang$core$Native_List.Cons(init(value[i]), list);
		}
		return {
			ctor: 'Constructor',
			_0: ctorStarter === '_Tupl' ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(ctor),
			_1: true,
			_2: _elm_lang$core$List$reverse(list)
		};
	}

	if (type === 'object')
	{
		var dict = _elm_lang$core$Dict$empty;
		for (var i in value)
		{
			dict = A3(_elm_lang$core$Dict$insert, i, init(value[i]), dict);
		}
		return { ctor: 'Record', _0: true, _1: dict };
	}

	return primitive('XXX');
}

var initCons = F2(initConsHelp);

function initConsHelp(value, list)
{
	return _elm_lang$core$Native_List.Cons(init(value), list);
}

var initKeyValueCons = F3(initKeyValueConsHelp);

function initKeyValueConsHelp(key, value, list)
{
	return _elm_lang$core$Native_List.Cons(
		_elm_lang$core$Native_Utils.Tuple2(init(key), init(value)),
		list
	);
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
	upload: upload,
	download: F2(download),
	unsafeCoerce: unsafeCoerce,
	messageToString: messageToString,
	init: init
}

}();

var _elm_lang$virtual_dom$VirtualDom_Helpers$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom_Helpers$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom_Helpers$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom_Helpers$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom_Helpers$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom_Helpers$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom_Helpers$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom_Helpers$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom_Helpers$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom_Helpers$onClick = function (msg) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$virtual_dom$VirtualDom_Helpers$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom_Helpers$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom_Helpers$id = _elm_lang$virtual_dom$VirtualDom_Helpers$attribute('id');
var _elm_lang$virtual_dom$VirtualDom_Helpers$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom_Helpers$class = function (name) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$property,
		'className',
		_elm_lang$core$Json_Encode$string(name));
};
var _elm_lang$virtual_dom$VirtualDom_Helpers$href = function (name) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$property,
		'href',
		_elm_lang$core$Json_Encode$string(name));
};
var _elm_lang$virtual_dom$VirtualDom_Helpers$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom_Helpers$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom_Helpers$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom_Helpers$div = _elm_lang$virtual_dom$VirtualDom_Helpers$node('div');
var _elm_lang$virtual_dom$VirtualDom_Helpers$span = _elm_lang$virtual_dom$VirtualDom_Helpers$node('span');
var _elm_lang$virtual_dom$VirtualDom_Helpers$a = _elm_lang$virtual_dom$VirtualDom_Helpers$node('a');
var _elm_lang$virtual_dom$VirtualDom_Helpers$h1 = _elm_lang$virtual_dom$VirtualDom_Helpers$node('h1');
var _elm_lang$virtual_dom$VirtualDom_Helpers$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Helpers$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom_Helpers$Property = {ctor: 'Property'};

var _elm_lang$virtual_dom$VirtualDom_Expando$purple = _elm_lang$virtual_dom$VirtualDom_Helpers$style(
	{
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: 'color', _1: 'rgb(136, 19, 145)'},
		_1: {ctor: '[]'}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$blue = _elm_lang$virtual_dom$VirtualDom_Helpers$style(
	{
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: 'color', _1: 'rgb(28, 0, 207)'},
		_1: {ctor: '[]'}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$red = _elm_lang$virtual_dom$VirtualDom_Helpers$style(
	{
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: 'color', _1: 'rgb(196, 26, 22)'},
		_1: {ctor: '[]'}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$leftPad = function (maybeKey) {
	var _p0 = maybeKey;
	if (_p0.ctor === 'Nothing') {
		return _elm_lang$virtual_dom$VirtualDom_Helpers$style(
			{ctor: '[]'});
	} else {
		return _elm_lang$virtual_dom$VirtualDom_Helpers$style(
			{
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'padding-left', _1: '4ch'},
				_1: {ctor: '[]'}
			});
	}
};
var _elm_lang$virtual_dom$VirtualDom_Expando$makeArrow = function (arrow) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$span,
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'color', _1: '#777'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'padding-left', _1: '2ch'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'width', _1: '2ch'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'display', _1: 'inline-block'},
								_1: {ctor: '[]'}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(arrow),
			_1: {ctor: '[]'}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Expando$lineStarter = F3(
	function (maybeKey, maybeIsClosed, description) {
		var arrow = function () {
			var _p1 = maybeIsClosed;
			if (_p1.ctor === 'Nothing') {
				return _elm_lang$virtual_dom$VirtualDom_Expando$makeArrow('');
			} else {
				if (_p1._0 === true) {
					return _elm_lang$virtual_dom$VirtualDom_Expando$makeArrow('▸');
				} else {
					return _elm_lang$virtual_dom$VirtualDom_Expando$makeArrow('▾');
				}
			}
		}();
		var _p2 = maybeKey;
		if (_p2.ctor === 'Nothing') {
			return {ctor: '::', _0: arrow, _1: description};
		} else {
			return {
				ctor: '::',
				_0: arrow,
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$span,
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Expando$purple,
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p2._0),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' = '),
						_1: description
					}
				}
			};
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewExtraTinyRecord = F3(
	function (length, starter, entries) {
		var _p3 = entries;
		if (_p3.ctor === '[]') {
			return {
				ctor: '_Tuple2',
				_0: length + 1,
				_1: {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('}'),
					_1: {ctor: '[]'}
				}
			};
		} else {
			var _p5 = _p3._0;
			var nextLength = (length + _elm_lang$core$String$length(_p5)) + 1;
			if (_elm_lang$core$Native_Utils.cmp(nextLength, 18) > 0) {
				return {
					ctor: '_Tuple2',
					_0: length + 2,
					_1: {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('…}'),
						_1: {ctor: '[]'}
					}
				};
			} else {
				var _p4 = A3(_elm_lang$virtual_dom$VirtualDom_Expando$viewExtraTinyRecord, nextLength, ',', _p3._1);
				var finalLength = _p4._0;
				var otherNodes = _p4._1;
				return {
					ctor: '_Tuple2',
					_0: finalLength,
					_1: {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(starter),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$span,
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Expando$purple,
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p5),
									_1: {ctor: '[]'}
								}),
							_1: otherNodes
						}
					}
				};
			}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$elideMiddle = function (str) {
	return (_elm_lang$core$Native_Utils.cmp(
		_elm_lang$core$String$length(str),
		18) < 1) ? str : A2(
		_elm_lang$core$Basics_ops['++'],
		A2(_elm_lang$core$String$left, 8, str),
		A2(
			_elm_lang$core$Basics_ops['++'],
			'...',
			A2(_elm_lang$core$String$right, 8, str)));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyHelp = function (str) {
	return {
		ctor: '_Tuple2',
		_0: _elm_lang$core$String$length(str),
		_1: {
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(str),
			_1: {ctor: '[]'}
		}
	};
};
var _elm_lang$virtual_dom$VirtualDom_Expando$updateIndex = F3(
	function (n, func, list) {
		var _p6 = list;
		if (_p6.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var _p8 = _p6._1;
			var _p7 = _p6._0;
			return (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) ? {
				ctor: '::',
				_0: func(_p7),
				_1: _p8
			} : {
				ctor: '::',
				_0: _p7,
				_1: A3(_elm_lang$virtual_dom$VirtualDom_Expando$updateIndex, n - 1, func, _p8)
			};
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$seqTypeToString = F2(
	function (n, seqType) {
		var _p9 = seqType;
		switch (_p9.ctor) {
			case 'ListSeq':
				return A2(
					_elm_lang$core$Basics_ops['++'],
					'List(',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(n),
						')'));
			case 'SetSeq':
				return A2(
					_elm_lang$core$Basics_ops['++'],
					'Set(',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(n),
						')'));
			default:
				return A2(
					_elm_lang$core$Basics_ops['++'],
					'Array(',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(n),
						')'));
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewTiny = function (value) {
	var _p10 = value;
	switch (_p10.ctor) {
		case 'S':
			var str = _elm_lang$virtual_dom$VirtualDom_Expando$elideMiddle(_p10._0);
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$String$length(str),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$span,
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Expando$red,
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(str),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			};
		case 'Primitive':
			var _p11 = _p10._0;
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$String$length(_p11),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$span,
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Expando$blue,
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p11),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			};
		case 'Sequence':
			return _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyHelp(
				A2(
					_elm_lang$virtual_dom$VirtualDom_Expando$seqTypeToString,
					_elm_lang$core$List$length(_p10._2),
					_p10._0));
		case 'Dictionary':
			return _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyHelp(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'Dict(',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(
							_elm_lang$core$List$length(_p10._1)),
						')')));
		case 'Record':
			return _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyRecord(_p10._1);
		default:
			if (_p10._2.ctor === '[]') {
				return _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyHelp(
					A2(_elm_lang$core$Maybe$withDefault, 'Unit', _p10._0));
			} else {
				return _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyHelp(
					function () {
						var _p12 = _p10._0;
						if (_p12.ctor === 'Nothing') {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								'Tuple(',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(
										_elm_lang$core$List$length(_p10._2)),
									')'));
						} else {
							return A2(_elm_lang$core$Basics_ops['++'], _p12._0, ' …');
						}
					}());
			}
	}
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyRecord = function (record) {
	return _elm_lang$core$Dict$isEmpty(record) ? {
		ctor: '_Tuple2',
		_0: 2,
		_1: {
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('{}'),
			_1: {ctor: '[]'}
		}
	} : A3(
		_elm_lang$virtual_dom$VirtualDom_Expando$viewTinyRecordHelp,
		0,
		'{ ',
		_elm_lang$core$Dict$toList(record));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyRecordHelp = F3(
	function (length, starter, entries) {
		var _p13 = entries;
		if (_p13.ctor === '[]') {
			return {
				ctor: '_Tuple2',
				_0: length + 2,
				_1: {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' }'),
					_1: {ctor: '[]'}
				}
			};
		} else {
			var _p16 = _p13._0._0;
			var _p14 = _elm_lang$virtual_dom$VirtualDom_Expando$viewExtraTiny(_p13._0._1);
			var valueLen = _p14._0;
			var valueNodes = _p14._1;
			var fieldLen = _elm_lang$core$String$length(_p16);
			var newLength = ((length + fieldLen) + valueLen) + 5;
			if (_elm_lang$core$Native_Utils.cmp(newLength, 60) > 0) {
				return {
					ctor: '_Tuple2',
					_0: length + 4,
					_1: {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(', … }'),
						_1: {ctor: '[]'}
					}
				};
			} else {
				var _p15 = A3(_elm_lang$virtual_dom$VirtualDom_Expando$viewTinyRecordHelp, newLength, ', ', _p13._1);
				var finalLength = _p15._0;
				var otherNodes = _p15._1;
				return {
					ctor: '_Tuple2',
					_0: finalLength,
					_1: {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(starter),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$span,
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Expando$purple,
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p16),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' = '),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$virtual_dom$VirtualDom_Helpers$span,
										{ctor: '[]'},
										valueNodes),
									_1: otherNodes
								}
							}
						}
					}
				};
			}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewExtraTiny = function (value) {
	var _p17 = value;
	if (_p17.ctor === 'Record') {
		return A3(
			_elm_lang$virtual_dom$VirtualDom_Expando$viewExtraTinyRecord,
			0,
			'{',
			_elm_lang$core$Dict$keys(_p17._1));
	} else {
		return _elm_lang$virtual_dom$VirtualDom_Expando$viewTiny(value);
	}
};
var _elm_lang$virtual_dom$VirtualDom_Expando$Constructor = F3(
	function (a, b, c) {
		return {ctor: 'Constructor', _0: a, _1: b, _2: c};
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$Record = F2(
	function (a, b) {
		return {ctor: 'Record', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$Dictionary = F2(
	function (a, b) {
		return {ctor: 'Dictionary', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$Sequence = F3(
	function (a, b, c) {
		return {ctor: 'Sequence', _0: a, _1: b, _2: c};
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$initHelp = F2(
	function (isOuter, expando) {
		var _p18 = expando;
		switch (_p18.ctor) {
			case 'S':
				return expando;
			case 'Primitive':
				return expando;
			case 'Sequence':
				var _p20 = _p18._0;
				var _p19 = _p18._2;
				return isOuter ? A3(
					_elm_lang$virtual_dom$VirtualDom_Expando$Sequence,
					_p20,
					false,
					A2(
						_elm_lang$core$List$map,
						_elm_lang$virtual_dom$VirtualDom_Expando$initHelp(false),
						_p19)) : ((_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$List$length(_p19),
					8) < 1) ? A3(_elm_lang$virtual_dom$VirtualDom_Expando$Sequence, _p20, false, _p19) : expando);
			case 'Dictionary':
				var _p23 = _p18._1;
				return isOuter ? A2(
					_elm_lang$virtual_dom$VirtualDom_Expando$Dictionary,
					false,
					A2(
						_elm_lang$core$List$map,
						function (_p21) {
							var _p22 = _p21;
							return {
								ctor: '_Tuple2',
								_0: _p22._0,
								_1: A2(_elm_lang$virtual_dom$VirtualDom_Expando$initHelp, false, _p22._1)
							};
						},
						_p23)) : ((_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$List$length(_p23),
					8) < 1) ? A2(_elm_lang$virtual_dom$VirtualDom_Expando$Dictionary, false, _p23) : expando);
			case 'Record':
				var _p25 = _p18._1;
				return isOuter ? A2(
					_elm_lang$virtual_dom$VirtualDom_Expando$Record,
					false,
					A2(
						_elm_lang$core$Dict$map,
						F2(
							function (_p24, v) {
								return A2(_elm_lang$virtual_dom$VirtualDom_Expando$initHelp, false, v);
							}),
						_p25)) : ((_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$Dict$size(_p25),
					4) < 1) ? A2(_elm_lang$virtual_dom$VirtualDom_Expando$Record, false, _p25) : expando);
			default:
				var _p27 = _p18._0;
				var _p26 = _p18._2;
				return isOuter ? A3(
					_elm_lang$virtual_dom$VirtualDom_Expando$Constructor,
					_p27,
					false,
					A2(
						_elm_lang$core$List$map,
						_elm_lang$virtual_dom$VirtualDom_Expando$initHelp(false),
						_p26)) : ((_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$List$length(_p26),
					4) < 1) ? A3(_elm_lang$virtual_dom$VirtualDom_Expando$Constructor, _p27, false, _p26) : expando);
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$init = function (value) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Expando$initHelp,
		true,
		_elm_lang$virtual_dom$Native_Debug.init(value));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$mergeHelp = F2(
	function (old, $new) {
		var _p28 = {ctor: '_Tuple2', _0: old, _1: $new};
		_v12_6:
		do {
			if (_p28.ctor === '_Tuple2') {
				switch (_p28._1.ctor) {
					case 'S':
						return $new;
					case 'Primitive':
						return $new;
					case 'Sequence':
						if (_p28._0.ctor === 'Sequence') {
							return A3(
								_elm_lang$virtual_dom$VirtualDom_Expando$Sequence,
								_p28._1._0,
								_p28._0._1,
								A2(_elm_lang$virtual_dom$VirtualDom_Expando$mergeListHelp, _p28._0._2, _p28._1._2));
						} else {
							break _v12_6;
						}
					case 'Dictionary':
						if (_p28._0.ctor === 'Dictionary') {
							return A2(_elm_lang$virtual_dom$VirtualDom_Expando$Dictionary, _p28._0._0, _p28._1._1);
						} else {
							break _v12_6;
						}
					case 'Record':
						if (_p28._0.ctor === 'Record') {
							return A2(
								_elm_lang$virtual_dom$VirtualDom_Expando$Record,
								_p28._0._0,
								A2(
									_elm_lang$core$Dict$map,
									_elm_lang$virtual_dom$VirtualDom_Expando$mergeDictHelp(_p28._0._1),
									_p28._1._1));
						} else {
							break _v12_6;
						}
					default:
						if (_p28._0.ctor === 'Constructor') {
							return A3(
								_elm_lang$virtual_dom$VirtualDom_Expando$Constructor,
								_p28._1._0,
								_p28._0._1,
								A2(_elm_lang$virtual_dom$VirtualDom_Expando$mergeListHelp, _p28._0._2, _p28._1._2));
						} else {
							break _v12_6;
						}
				}
			} else {
				break _v12_6;
			}
		} while(false);
		return $new;
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$mergeDictHelp = F3(
	function (oldDict, key, value) {
		var _p29 = A2(_elm_lang$core$Dict$get, key, oldDict);
		if (_p29.ctor === 'Nothing') {
			return value;
		} else {
			return A2(_elm_lang$virtual_dom$VirtualDom_Expando$mergeHelp, _p29._0, value);
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$mergeListHelp = F2(
	function (olds, news) {
		var _p30 = {ctor: '_Tuple2', _0: olds, _1: news};
		if (_p30._0.ctor === '[]') {
			return news;
		} else {
			if (_p30._1.ctor === '[]') {
				return news;
			} else {
				return {
					ctor: '::',
					_0: A2(_elm_lang$virtual_dom$VirtualDom_Expando$mergeHelp, _p30._0._0, _p30._1._0),
					_1: A2(_elm_lang$virtual_dom$VirtualDom_Expando$mergeListHelp, _p30._0._1, _p30._1._1)
				};
			}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$merge = F2(
	function (value, expando) {
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Expando$mergeHelp,
			expando,
			_elm_lang$virtual_dom$Native_Debug.init(value));
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$update = F2(
	function (msg, value) {
		var _p31 = value;
		switch (_p31.ctor) {
			case 'S':
				return _elm_lang$core$Native_Utils.crashCase(
					'VirtualDom.Expando',
					{
						start: {line: 168, column: 3},
						end: {line: 235, column: 50}
					},
					_p31)('No messages for primitives');
			case 'Primitive':
				return _elm_lang$core$Native_Utils.crashCase(
					'VirtualDom.Expando',
					{
						start: {line: 168, column: 3},
						end: {line: 235, column: 50}
					},
					_p31)('No messages for primitives');
			case 'Sequence':
				var _p39 = _p31._2;
				var _p38 = _p31._0;
				var _p37 = _p31._1;
				var _p34 = msg;
				switch (_p34.ctor) {
					case 'Toggle':
						return A3(_elm_lang$virtual_dom$VirtualDom_Expando$Sequence, _p38, !_p37, _p39);
					case 'Index':
						if (_p34._0.ctor === 'None') {
							return A3(
								_elm_lang$virtual_dom$VirtualDom_Expando$Sequence,
								_p38,
								_p37,
								A3(
									_elm_lang$virtual_dom$VirtualDom_Expando$updateIndex,
									_p34._1,
									_elm_lang$virtual_dom$VirtualDom_Expando$update(_p34._2),
									_p39));
						} else {
							return _elm_lang$core$Native_Utils.crashCase(
								'VirtualDom.Expando',
								{
									start: {line: 176, column: 7},
									end: {line: 188, column: 46}
								},
								_p34)('No redirected indexes on sequences');
						}
					default:
						return _elm_lang$core$Native_Utils.crashCase(
							'VirtualDom.Expando',
							{
								start: {line: 176, column: 7},
								end: {line: 188, column: 46}
							},
							_p34)('No field on sequences');
				}
			case 'Dictionary':
				var _p51 = _p31._1;
				var _p50 = _p31._0;
				var _p40 = msg;
				switch (_p40.ctor) {
					case 'Toggle':
						return A2(_elm_lang$virtual_dom$VirtualDom_Expando$Dictionary, !_p50, _p51);
					case 'Index':
						var _p48 = _p40._2;
						var _p47 = _p40._1;
						var _p41 = _p40._0;
						switch (_p41.ctor) {
							case 'None':
								return _elm_lang$core$Native_Utils.crashCase(
									'VirtualDom.Expando',
									{
										start: {line: 196, column: 11},
										end: {line: 206, column: 81}
									},
									_p41)('must have redirect for dictionaries');
							case 'Key':
								return A2(
									_elm_lang$virtual_dom$VirtualDom_Expando$Dictionary,
									_p50,
									A3(
										_elm_lang$virtual_dom$VirtualDom_Expando$updateIndex,
										_p47,
										function (_p43) {
											var _p44 = _p43;
											return {
												ctor: '_Tuple2',
												_0: A2(_elm_lang$virtual_dom$VirtualDom_Expando$update, _p48, _p44._0),
												_1: _p44._1
											};
										},
										_p51));
							default:
								return A2(
									_elm_lang$virtual_dom$VirtualDom_Expando$Dictionary,
									_p50,
									A3(
										_elm_lang$virtual_dom$VirtualDom_Expando$updateIndex,
										_p47,
										function (_p45) {
											var _p46 = _p45;
											return {
												ctor: '_Tuple2',
												_0: _p46._0,
												_1: A2(_elm_lang$virtual_dom$VirtualDom_Expando$update, _p48, _p46._1)
											};
										},
										_p51));
						}
					default:
						return _elm_lang$core$Native_Utils.crashCase(
							'VirtualDom.Expando',
							{
								start: {line: 191, column: 7},
								end: {line: 209, column: 50}
							},
							_p40)('no field for dictionaries');
				}
			case 'Record':
				var _p55 = _p31._1;
				var _p54 = _p31._0;
				var _p52 = msg;
				switch (_p52.ctor) {
					case 'Toggle':
						return A2(_elm_lang$virtual_dom$VirtualDom_Expando$Record, !_p54, _p55);
					case 'Index':
						return _elm_lang$core$Native_Utils.crashCase(
							'VirtualDom.Expando',
							{
								start: {line: 212, column: 7},
								end: {line: 220, column: 77}
							},
							_p52)('No index for records');
					default:
						return A2(
							_elm_lang$virtual_dom$VirtualDom_Expando$Record,
							_p54,
							A3(
								_elm_lang$core$Dict$update,
								_p52._0,
								_elm_lang$virtual_dom$VirtualDom_Expando$updateField(_p52._1),
								_p55));
				}
			default:
				var _p61 = _p31._2;
				var _p60 = _p31._0;
				var _p59 = _p31._1;
				var _p56 = msg;
				switch (_p56.ctor) {
					case 'Toggle':
						return A3(_elm_lang$virtual_dom$VirtualDom_Expando$Constructor, _p60, !_p59, _p61);
					case 'Index':
						if (_p56._0.ctor === 'None') {
							return A3(
								_elm_lang$virtual_dom$VirtualDom_Expando$Constructor,
								_p60,
								_p59,
								A3(
									_elm_lang$virtual_dom$VirtualDom_Expando$updateIndex,
									_p56._1,
									_elm_lang$virtual_dom$VirtualDom_Expando$update(_p56._2),
									_p61));
						} else {
							return _elm_lang$core$Native_Utils.crashCase(
								'VirtualDom.Expando',
								{
									start: {line: 223, column: 7},
									end: {line: 235, column: 50}
								},
								_p56)('No redirected indexes on sequences');
						}
					default:
						return _elm_lang$core$Native_Utils.crashCase(
							'VirtualDom.Expando',
							{
								start: {line: 223, column: 7},
								end: {line: 235, column: 50}
							},
							_p56)('No field for constructors');
				}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$updateField = F2(
	function (msg, maybeExpando) {
		var _p62 = maybeExpando;
		if (_p62.ctor === 'Nothing') {
			return _elm_lang$core$Native_Utils.crashCase(
				'VirtualDom.Expando',
				{
					start: {line: 253, column: 3},
					end: {line: 258, column: 32}
				},
				_p62)('key does not exist');
		} else {
			return _elm_lang$core$Maybe$Just(
				A2(_elm_lang$virtual_dom$VirtualDom_Expando$update, msg, _p62._0));
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$Primitive = function (a) {
	return {ctor: 'Primitive', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Expando$S = function (a) {
	return {ctor: 'S', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Expando$ArraySeq = {ctor: 'ArraySeq'};
var _elm_lang$virtual_dom$VirtualDom_Expando$SetSeq = {ctor: 'SetSeq'};
var _elm_lang$virtual_dom$VirtualDom_Expando$ListSeq = {ctor: 'ListSeq'};
var _elm_lang$virtual_dom$VirtualDom_Expando$Field = F2(
	function (a, b) {
		return {ctor: 'Field', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$Index = F3(
	function (a, b, c) {
		return {ctor: 'Index', _0: a, _1: b, _2: c};
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$Toggle = {ctor: 'Toggle'};
var _elm_lang$virtual_dom$VirtualDom_Expando$Value = {ctor: 'Value'};
var _elm_lang$virtual_dom$VirtualDom_Expando$Key = {ctor: 'Key'};
var _elm_lang$virtual_dom$VirtualDom_Expando$None = {ctor: 'None'};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewConstructorEntry = F2(
	function (index, value) {
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$map,
			A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$None, index),
			A2(
				_elm_lang$virtual_dom$VirtualDom_Expando$view,
				_elm_lang$core$Maybe$Just(
					_elm_lang$core$Basics$toString(index)),
				value));
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$view = F2(
	function (maybeKey, expando) {
		var _p64 = expando;
		switch (_p64.ctor) {
			case 'S':
				return A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Expando$leftPad(maybeKey),
						_1: {ctor: '[]'}
					},
					A3(
						_elm_lang$virtual_dom$VirtualDom_Expando$lineStarter,
						maybeKey,
						_elm_lang$core$Maybe$Nothing,
						{
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$span,
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Expando$red,
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p64._0),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}));
			case 'Primitive':
				return A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Expando$leftPad(maybeKey),
						_1: {ctor: '[]'}
					},
					A3(
						_elm_lang$virtual_dom$VirtualDom_Expando$lineStarter,
						maybeKey,
						_elm_lang$core$Maybe$Nothing,
						{
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$span,
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Expando$blue,
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p64._0),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}));
			case 'Sequence':
				return A4(_elm_lang$virtual_dom$VirtualDom_Expando$viewSequence, maybeKey, _p64._0, _p64._1, _p64._2);
			case 'Dictionary':
				return A3(_elm_lang$virtual_dom$VirtualDom_Expando$viewDictionary, maybeKey, _p64._0, _p64._1);
			case 'Record':
				return A3(_elm_lang$virtual_dom$VirtualDom_Expando$viewRecord, maybeKey, _p64._0, _p64._1);
			default:
				return A4(_elm_lang$virtual_dom$VirtualDom_Expando$viewConstructor, maybeKey, _p64._0, _p64._1, _p64._2);
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewConstructor = F4(
	function (maybeKey, maybeName, isClosed, valueList) {
		var _p65 = function () {
			var _p66 = valueList;
			if (_p66.ctor === '[]') {
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Nothing,
					_1: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$div,
						{ctor: '[]'},
						{ctor: '[]'})
				};
			} else {
				if (_p66._1.ctor === '[]') {
					var _p67 = _p66._0;
					switch (_p67.ctor) {
						case 'S':
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Nothing,
								_1: A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$div,
									{ctor: '[]'},
									{ctor: '[]'})
							};
						case 'Primitive':
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Nothing,
								_1: A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$div,
									{ctor: '[]'},
									{ctor: '[]'})
							};
						case 'Sequence':
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Just(isClosed),
								_1: isClosed ? A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$div,
									{ctor: '[]'},
									{ctor: '[]'}) : A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$map,
									A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$None, 0),
									_elm_lang$virtual_dom$VirtualDom_Expando$viewSequenceOpen(_p67._2))
							};
						case 'Dictionary':
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Just(isClosed),
								_1: isClosed ? A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$div,
									{ctor: '[]'},
									{ctor: '[]'}) : A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$map,
									A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$None, 0),
									_elm_lang$virtual_dom$VirtualDom_Expando$viewDictionaryOpen(_p67._1))
							};
						case 'Record':
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Just(isClosed),
								_1: isClosed ? A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$div,
									{ctor: '[]'},
									{ctor: '[]'}) : A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$map,
									A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$None, 0),
									_elm_lang$virtual_dom$VirtualDom_Expando$viewRecordOpen(_p67._1))
							};
						default:
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Just(isClosed),
								_1: isClosed ? A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$div,
									{ctor: '[]'},
									{ctor: '[]'}) : A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$map,
									A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$None, 0),
									_elm_lang$virtual_dom$VirtualDom_Expando$viewConstructorOpen(_p67._2))
							};
					}
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(isClosed),
						_1: isClosed ? A2(
							_elm_lang$virtual_dom$VirtualDom_Helpers$div,
							{ctor: '[]'},
							{ctor: '[]'}) : _elm_lang$virtual_dom$VirtualDom_Expando$viewConstructorOpen(valueList)
					};
				}
			}
		}();
		var maybeIsClosed = _p65._0;
		var openHtml = _p65._1;
		var tinyArgs = A2(
			_elm_lang$core$List$map,
			function (_p68) {
				return _elm_lang$core$Tuple$second(
					_elm_lang$virtual_dom$VirtualDom_Expando$viewExtraTiny(_p68));
			},
			valueList);
		var description = function () {
			var _p69 = {ctor: '_Tuple2', _0: maybeName, _1: tinyArgs};
			if (_p69._0.ctor === 'Nothing') {
				if (_p69._1.ctor === '[]') {
					return {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('()'),
						_1: {ctor: '[]'}
					};
				} else {
					return {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('( '),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$span,
								{ctor: '[]'},
								_p69._1._0),
							_1: A3(
								_elm_lang$core$List$foldr,
								F2(
									function (args, rest) {
										return {
											ctor: '::',
											_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(', '),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$virtual_dom$VirtualDom_Helpers$span,
													{ctor: '[]'},
													args),
												_1: rest
											}
										};
									}),
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' )'),
									_1: {ctor: '[]'}
								},
								_p69._1._1)
						}
					};
				}
			} else {
				if (_p69._1.ctor === '[]') {
					return {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p69._0._0),
						_1: {ctor: '[]'}
					};
				} else {
					return {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(
							A2(_elm_lang$core$Basics_ops['++'], _p69._0._0, ' ')),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$span,
								{ctor: '[]'},
								_p69._1._0),
							_1: A3(
								_elm_lang$core$List$foldr,
								F2(
									function (args, rest) {
										return {
											ctor: '::',
											_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' '),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$virtual_dom$VirtualDom_Helpers$span,
													{ctor: '[]'},
													args),
												_1: rest
											}
										};
									}),
								{ctor: '[]'},
								_p69._1._1)
						}
					};
				}
			}
		}();
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Expando$leftPad(maybeKey),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Expando$Toggle),
						_1: {ctor: '[]'}
					},
					A3(_elm_lang$virtual_dom$VirtualDom_Expando$lineStarter, maybeKey, maybeIsClosed, description)),
				_1: {
					ctor: '::',
					_0: openHtml,
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewConstructorOpen = function (valueList) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{ctor: '[]'},
		A2(_elm_lang$core$List$indexedMap, _elm_lang$virtual_dom$VirtualDom_Expando$viewConstructorEntry, valueList));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewDictionaryOpen = function (keyValuePairs) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{ctor: '[]'},
		A2(_elm_lang$core$List$indexedMap, _elm_lang$virtual_dom$VirtualDom_Expando$viewDictionaryEntry, keyValuePairs));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewDictionaryEntry = F2(
	function (index, _p70) {
		var _p71 = _p70;
		var _p74 = _p71._1;
		var _p73 = _p71._0;
		var _p72 = _p73;
		switch (_p72.ctor) {
			case 'S':
				return A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$map,
					A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$Value, index),
					A2(
						_elm_lang$virtual_dom$VirtualDom_Expando$view,
						_elm_lang$core$Maybe$Just(_p72._0),
						_p74));
			case 'Primitive':
				return A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$map,
					A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$Value, index),
					A2(
						_elm_lang$virtual_dom$VirtualDom_Expando$view,
						_elm_lang$core$Maybe$Just(_p72._0),
						_p74));
			default:
				return A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$virtual_dom$VirtualDom_Helpers$map,
							A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$Key, index),
							A2(
								_elm_lang$virtual_dom$VirtualDom_Expando$view,
								_elm_lang$core$Maybe$Just('key'),
								_p73)),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$map,
								A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$Value, index),
								A2(
									_elm_lang$virtual_dom$VirtualDom_Expando$view,
									_elm_lang$core$Maybe$Just('value'),
									_p74)),
							_1: {ctor: '[]'}
						}
					});
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewRecordOpen = function (record) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{ctor: '[]'},
		A2(
			_elm_lang$core$List$map,
			_elm_lang$virtual_dom$VirtualDom_Expando$viewRecordEntry,
			_elm_lang$core$Dict$toList(record)));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewRecordEntry = function (_p75) {
	var _p76 = _p75;
	var _p77 = _p76._0;
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$map,
		_elm_lang$virtual_dom$VirtualDom_Expando$Field(_p77),
		A2(
			_elm_lang$virtual_dom$VirtualDom_Expando$view,
			_elm_lang$core$Maybe$Just(_p77),
			_p76._1));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewSequenceOpen = function (values) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{ctor: '[]'},
		A2(_elm_lang$core$List$indexedMap, _elm_lang$virtual_dom$VirtualDom_Expando$viewConstructorEntry, values));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewDictionary = F3(
	function (maybeKey, isClosed, keyValuePairs) {
		var starter = A2(
			_elm_lang$core$Basics_ops['++'],
			'Dict(',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(
					_elm_lang$core$List$length(keyValuePairs)),
				')'));
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Expando$leftPad(maybeKey),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Expando$Toggle),
						_1: {ctor: '[]'}
					},
					A3(
						_elm_lang$virtual_dom$VirtualDom_Expando$lineStarter,
						maybeKey,
						_elm_lang$core$Maybe$Just(isClosed),
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(starter),
							_1: {ctor: '[]'}
						})),
				_1: {
					ctor: '::',
					_0: isClosed ? _elm_lang$virtual_dom$VirtualDom_Helpers$text('') : _elm_lang$virtual_dom$VirtualDom_Expando$viewDictionaryOpen(keyValuePairs),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewRecord = F3(
	function (maybeKey, isClosed, record) {
		var _p78 = isClosed ? {
			ctor: '_Tuple3',
			_0: _elm_lang$core$Tuple$second(
				_elm_lang$virtual_dom$VirtualDom_Expando$viewTinyRecord(record)),
			_1: _elm_lang$virtual_dom$VirtualDom_Helpers$text(''),
			_2: _elm_lang$virtual_dom$VirtualDom_Helpers$text('')
		} : {
			ctor: '_Tuple3',
			_0: {
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('{'),
				_1: {ctor: '[]'}
			},
			_1: _elm_lang$virtual_dom$VirtualDom_Expando$viewRecordOpen(record),
			_2: A2(
				_elm_lang$virtual_dom$VirtualDom_Helpers$div,
				{
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Expando$leftPad(
						_elm_lang$core$Maybe$Just(
							{ctor: '_Tuple0'})),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('}'),
					_1: {ctor: '[]'}
				})
		};
		var start = _p78._0;
		var middle = _p78._1;
		var end = _p78._2;
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Expando$leftPad(maybeKey),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Expando$Toggle),
						_1: {ctor: '[]'}
					},
					A3(
						_elm_lang$virtual_dom$VirtualDom_Expando$lineStarter,
						maybeKey,
						_elm_lang$core$Maybe$Just(isClosed),
						start)),
				_1: {
					ctor: '::',
					_0: middle,
					_1: {
						ctor: '::',
						_0: end,
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewSequence = F4(
	function (maybeKey, seqType, isClosed, valueList) {
		var starter = A2(
			_elm_lang$virtual_dom$VirtualDom_Expando$seqTypeToString,
			_elm_lang$core$List$length(valueList),
			seqType);
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Expando$leftPad(maybeKey),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Expando$Toggle),
						_1: {ctor: '[]'}
					},
					A3(
						_elm_lang$virtual_dom$VirtualDom_Expando$lineStarter,
						maybeKey,
						_elm_lang$core$Maybe$Just(isClosed),
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(starter),
							_1: {ctor: '[]'}
						})),
				_1: {
					ctor: '::',
					_0: isClosed ? _elm_lang$virtual_dom$VirtualDom_Helpers$text('') : _elm_lang$virtual_dom$VirtualDom_Expando$viewSequenceOpen(valueList),
					_1: {ctor: '[]'}
				}
			});
	});

var _elm_lang$virtual_dom$VirtualDom_Report$some = function (list) {
	return !_elm_lang$core$List$isEmpty(list);
};
var _elm_lang$virtual_dom$VirtualDom_Report$TagChanges = F4(
	function (a, b, c, d) {
		return {removed: a, changed: b, added: c, argsMatch: d};
	});
var _elm_lang$virtual_dom$VirtualDom_Report$emptyTagChanges = function (argsMatch) {
	return A4(
		_elm_lang$virtual_dom$VirtualDom_Report$TagChanges,
		{ctor: '[]'},
		{ctor: '[]'},
		{ctor: '[]'},
		argsMatch);
};
var _elm_lang$virtual_dom$VirtualDom_Report$hasTagChanges = function (tagChanges) {
	return _elm_lang$core$Native_Utils.eq(
		tagChanges,
		A4(
			_elm_lang$virtual_dom$VirtualDom_Report$TagChanges,
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'},
			true));
};
var _elm_lang$virtual_dom$VirtualDom_Report$SomethingChanged = function (a) {
	return {ctor: 'SomethingChanged', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Report$MessageChanged = F2(
	function (a, b) {
		return {ctor: 'MessageChanged', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Report$VersionChanged = F2(
	function (a, b) {
		return {ctor: 'VersionChanged', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Report$CorruptHistory = {ctor: 'CorruptHistory'};
var _elm_lang$virtual_dom$VirtualDom_Report$UnionChange = F2(
	function (a, b) {
		return {ctor: 'UnionChange', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Report$AliasChange = function (a) {
	return {ctor: 'AliasChange', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Report$Fine = {ctor: 'Fine'};
var _elm_lang$virtual_dom$VirtualDom_Report$Risky = {ctor: 'Risky'};
var _elm_lang$virtual_dom$VirtualDom_Report$Impossible = {ctor: 'Impossible'};
var _elm_lang$virtual_dom$VirtualDom_Report$worstCase = F2(
	function (status, statusList) {
		worstCase:
		while (true) {
			var _p0 = statusList;
			if (_p0.ctor === '[]') {
				return status;
			} else {
				switch (_p0._0.ctor) {
					case 'Impossible':
						return _elm_lang$virtual_dom$VirtualDom_Report$Impossible;
					case 'Risky':
						var _v1 = _elm_lang$virtual_dom$VirtualDom_Report$Risky,
							_v2 = _p0._1;
						status = _v1;
						statusList = _v2;
						continue worstCase;
					default:
						var _v3 = status,
							_v4 = _p0._1;
						status = _v3;
						statusList = _v4;
						continue worstCase;
				}
			}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Report$evaluateChange = function (change) {
	var _p1 = change;
	if (_p1.ctor === 'AliasChange') {
		return _elm_lang$virtual_dom$VirtualDom_Report$Impossible;
	} else {
		return ((!_p1._1.argsMatch) || (_elm_lang$virtual_dom$VirtualDom_Report$some(_p1._1.changed) || _elm_lang$virtual_dom$VirtualDom_Report$some(_p1._1.removed))) ? _elm_lang$virtual_dom$VirtualDom_Report$Impossible : (_elm_lang$virtual_dom$VirtualDom_Report$some(_p1._1.added) ? _elm_lang$virtual_dom$VirtualDom_Report$Risky : _elm_lang$virtual_dom$VirtualDom_Report$Fine);
	}
};
var _elm_lang$virtual_dom$VirtualDom_Report$evaluate = function (report) {
	var _p2 = report;
	switch (_p2.ctor) {
		case 'CorruptHistory':
			return _elm_lang$virtual_dom$VirtualDom_Report$Impossible;
		case 'VersionChanged':
			return _elm_lang$virtual_dom$VirtualDom_Report$Impossible;
		case 'MessageChanged':
			return _elm_lang$virtual_dom$VirtualDom_Report$Impossible;
		default:
			return A2(
				_elm_lang$virtual_dom$VirtualDom_Report$worstCase,
				_elm_lang$virtual_dom$VirtualDom_Report$Fine,
				A2(_elm_lang$core$List$map, _elm_lang$virtual_dom$VirtualDom_Report$evaluateChange, _p2._0));
	}
};

var _elm_lang$virtual_dom$VirtualDom_Metadata$encodeDict = F2(
	function (f, dict) {
		return _elm_lang$core$Json_Encode$object(
			_elm_lang$core$Dict$toList(
				A2(
					_elm_lang$core$Dict$map,
					F2(
						function (key, value) {
							return f(value);
						}),
					dict)));
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$encodeUnion = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'args',
				_1: _elm_lang$core$Json_Encode$list(
					A2(_elm_lang$core$List$map, _elm_lang$core$Json_Encode$string, _p1.args))
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'tags',
					_1: A2(
						_elm_lang$virtual_dom$VirtualDom_Metadata$encodeDict,
						function (_p2) {
							return _elm_lang$core$Json_Encode$list(
								A2(_elm_lang$core$List$map, _elm_lang$core$Json_Encode$string, _p2));
						},
						_p1.tags)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$encodeAlias = function (_p3) {
	var _p4 = _p3;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'args',
				_1: _elm_lang$core$Json_Encode$list(
					A2(_elm_lang$core$List$map, _elm_lang$core$Json_Encode$string, _p4.args))
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'type',
					_1: _elm_lang$core$Json_Encode$string(_p4.tipe)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$encodeTypes = function (_p5) {
	var _p6 = _p5;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'message',
				_1: _elm_lang$core$Json_Encode$string(_p6.message)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'aliases',
					_1: A2(_elm_lang$virtual_dom$VirtualDom_Metadata$encodeDict, _elm_lang$virtual_dom$VirtualDom_Metadata$encodeAlias, _p6.aliases)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'unions',
						_1: A2(_elm_lang$virtual_dom$VirtualDom_Metadata$encodeDict, _elm_lang$virtual_dom$VirtualDom_Metadata$encodeUnion, _p6.unions)
					},
					_1: {ctor: '[]'}
				}
			}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$encodeVersions = function (_p7) {
	var _p8 = _p7;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'elm',
				_1: _elm_lang$core$Json_Encode$string(_p8.elm)
			},
			_1: {ctor: '[]'}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$encode = function (_p9) {
	var _p10 = _p9;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'versions',
				_1: _elm_lang$virtual_dom$VirtualDom_Metadata$encodeVersions(_p10.versions)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'types',
					_1: _elm_lang$virtual_dom$VirtualDom_Metadata$encodeTypes(_p10.types)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$checkTag = F4(
	function (tag, old, $new, changes) {
		return _elm_lang$core$Native_Utils.eq(old, $new) ? changes : _elm_lang$core$Native_Utils.update(
			changes,
			{
				changed: {ctor: '::', _0: tag, _1: changes.changed}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$addTag = F3(
	function (tag, _p11, changes) {
		return _elm_lang$core$Native_Utils.update(
			changes,
			{
				added: {ctor: '::', _0: tag, _1: changes.added}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$removeTag = F3(
	function (tag, _p12, changes) {
		return _elm_lang$core$Native_Utils.update(
			changes,
			{
				removed: {ctor: '::', _0: tag, _1: changes.removed}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$checkUnion = F4(
	function (name, old, $new, changes) {
		var tagChanges = A6(
			_elm_lang$core$Dict$merge,
			_elm_lang$virtual_dom$VirtualDom_Metadata$removeTag,
			_elm_lang$virtual_dom$VirtualDom_Metadata$checkTag,
			_elm_lang$virtual_dom$VirtualDom_Metadata$addTag,
			old.tags,
			$new.tags,
			_elm_lang$virtual_dom$VirtualDom_Report$emptyTagChanges(
				_elm_lang$core$Native_Utils.eq(old.args, $new.args)));
		return _elm_lang$virtual_dom$VirtualDom_Report$hasTagChanges(tagChanges) ? changes : {
			ctor: '::',
			_0: A2(_elm_lang$virtual_dom$VirtualDom_Report$UnionChange, name, tagChanges),
			_1: changes
		};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$checkAlias = F4(
	function (name, old, $new, changes) {
		return (_elm_lang$core$Native_Utils.eq(old.tipe, $new.tipe) && _elm_lang$core$Native_Utils.eq(old.args, $new.args)) ? changes : {
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Report$AliasChange(name),
			_1: changes
		};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$ignore = F3(
	function (key, value, report) {
		return report;
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$checkTypes = F2(
	function (old, $new) {
		return (!_elm_lang$core$Native_Utils.eq(old.message, $new.message)) ? A2(_elm_lang$virtual_dom$VirtualDom_Report$MessageChanged, old.message, $new.message) : _elm_lang$virtual_dom$VirtualDom_Report$SomethingChanged(
			A6(
				_elm_lang$core$Dict$merge,
				_elm_lang$virtual_dom$VirtualDom_Metadata$ignore,
				_elm_lang$virtual_dom$VirtualDom_Metadata$checkUnion,
				_elm_lang$virtual_dom$VirtualDom_Metadata$ignore,
				old.unions,
				$new.unions,
				A6(
					_elm_lang$core$Dict$merge,
					_elm_lang$virtual_dom$VirtualDom_Metadata$ignore,
					_elm_lang$virtual_dom$VirtualDom_Metadata$checkAlias,
					_elm_lang$virtual_dom$VirtualDom_Metadata$ignore,
					old.aliases,
					$new.aliases,
					{ctor: '[]'})));
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$check = F2(
	function (old, $new) {
		return (!_elm_lang$core$Native_Utils.eq(old.versions.elm, $new.versions.elm)) ? A2(_elm_lang$virtual_dom$VirtualDom_Report$VersionChanged, old.versions.elm, $new.versions.elm) : A2(_elm_lang$virtual_dom$VirtualDom_Metadata$checkTypes, old.types, $new.types);
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$hasProblem = F2(
	function (tipe, _p13) {
		var _p14 = _p13;
		return A2(_elm_lang$core$String$contains, _p14._1, tipe) ? _elm_lang$core$Maybe$Just(_p14._0) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$Metadata = F2(
	function (a, b) {
		return {versions: a, types: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$Versions = function (a) {
	return {elm: a};
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$decodeVersions = A2(
	_elm_lang$core$Json_Decode$map,
	_elm_lang$virtual_dom$VirtualDom_Metadata$Versions,
	A2(_elm_lang$core$Json_Decode$field, 'elm', _elm_lang$core$Json_Decode$string));
var _elm_lang$virtual_dom$VirtualDom_Metadata$Types = F3(
	function (a, b, c) {
		return {message: a, aliases: b, unions: c};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$Alias = F2(
	function (a, b) {
		return {args: a, tipe: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$decodeAlias = A3(
	_elm_lang$core$Json_Decode$map2,
	_elm_lang$virtual_dom$VirtualDom_Metadata$Alias,
	A2(
		_elm_lang$core$Json_Decode$field,
		'args',
		_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string)),
	A2(_elm_lang$core$Json_Decode$field, 'type', _elm_lang$core$Json_Decode$string));
var _elm_lang$virtual_dom$VirtualDom_Metadata$Union = F2(
	function (a, b) {
		return {args: a, tags: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$decodeUnion = A3(
	_elm_lang$core$Json_Decode$map2,
	_elm_lang$virtual_dom$VirtualDom_Metadata$Union,
	A2(
		_elm_lang$core$Json_Decode$field,
		'args',
		_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string)),
	A2(
		_elm_lang$core$Json_Decode$field,
		'tags',
		_elm_lang$core$Json_Decode$dict(
			_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string))));
var _elm_lang$virtual_dom$VirtualDom_Metadata$decodeTypes = A4(
	_elm_lang$core$Json_Decode$map3,
	_elm_lang$virtual_dom$VirtualDom_Metadata$Types,
	A2(_elm_lang$core$Json_Decode$field, 'message', _elm_lang$core$Json_Decode$string),
	A2(
		_elm_lang$core$Json_Decode$field,
		'aliases',
		_elm_lang$core$Json_Decode$dict(_elm_lang$virtual_dom$VirtualDom_Metadata$decodeAlias)),
	A2(
		_elm_lang$core$Json_Decode$field,
		'unions',
		_elm_lang$core$Json_Decode$dict(_elm_lang$virtual_dom$VirtualDom_Metadata$decodeUnion)));
var _elm_lang$virtual_dom$VirtualDom_Metadata$decoder = A3(
	_elm_lang$core$Json_Decode$map2,
	_elm_lang$virtual_dom$VirtualDom_Metadata$Metadata,
	A2(_elm_lang$core$Json_Decode$field, 'versions', _elm_lang$virtual_dom$VirtualDom_Metadata$decodeVersions),
	A2(_elm_lang$core$Json_Decode$field, 'types', _elm_lang$virtual_dom$VirtualDom_Metadata$decodeTypes));
var _elm_lang$virtual_dom$VirtualDom_Metadata$Error = F2(
	function (a, b) {
		return {message: a, problems: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$ProblemType = F2(
	function (a, b) {
		return {name: a, problems: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$VirtualDom = {ctor: 'VirtualDom'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$Program = {ctor: 'Program'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$Request = {ctor: 'Request'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$Socket = {ctor: 'Socket'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$Process = {ctor: 'Process'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$Task = {ctor: 'Task'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$Decoder = {ctor: 'Decoder'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$Function = {ctor: 'Function'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$problemTable = {
	ctor: '::',
	_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$Function, _1: '->'},
	_1: {
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$Decoder, _1: 'Json.Decode.Decoder'},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$Task, _1: 'Task.Task'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$Process, _1: 'Process.Id'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$Socket, _1: 'WebSocket.LowLevel.WebSocket'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$Request, _1: 'Http.Request'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$Program, _1: 'Platform.Program'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$VirtualDom, _1: 'VirtualDom.Node'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$VirtualDom, _1: 'VirtualDom.Attribute'},
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$findProblems = function (tipe) {
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$virtual_dom$VirtualDom_Metadata$hasProblem(tipe),
		_elm_lang$virtual_dom$VirtualDom_Metadata$problemTable);
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$collectBadAliases = F3(
	function (name, _p15, list) {
		var _p16 = _p15;
		var _p17 = _elm_lang$virtual_dom$VirtualDom_Metadata$findProblems(_p16.tipe);
		if (_p17.ctor === '[]') {
			return list;
		} else {
			return {
				ctor: '::',
				_0: A2(_elm_lang$virtual_dom$VirtualDom_Metadata$ProblemType, name, _p17),
				_1: list
			};
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$collectBadUnions = F3(
	function (name, _p18, list) {
		var _p19 = _p18;
		var _p20 = A2(
			_elm_lang$core$List$concatMap,
			_elm_lang$virtual_dom$VirtualDom_Metadata$findProblems,
			_elm_lang$core$List$concat(
				_elm_lang$core$Dict$values(_p19.tags)));
		if (_p20.ctor === '[]') {
			return list;
		} else {
			return {
				ctor: '::',
				_0: A2(_elm_lang$virtual_dom$VirtualDom_Metadata$ProblemType, name, _p20),
				_1: list
			};
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$isPortable = function (_p21) {
	var _p22 = _p21;
	var _p24 = _p22.types;
	var badAliases = A3(
		_elm_lang$core$Dict$foldl,
		_elm_lang$virtual_dom$VirtualDom_Metadata$collectBadAliases,
		{ctor: '[]'},
		_p24.aliases);
	var _p23 = A3(_elm_lang$core$Dict$foldl, _elm_lang$virtual_dom$VirtualDom_Metadata$collectBadUnions, badAliases, _p24.unions);
	if (_p23.ctor === '[]') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		return _elm_lang$core$Maybe$Just(
			A2(_elm_lang$virtual_dom$VirtualDom_Metadata$Error, _p24.message, _p23));
	}
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$decode = function (value) {
	var _p25 = A2(_elm_lang$core$Json_Decode$decodeValue, _elm_lang$virtual_dom$VirtualDom_Metadata$decoder, value);
	if (_p25.ctor === 'Err') {
		return _elm_lang$core$Native_Utils.crashCase(
			'VirtualDom.Metadata',
			{
				start: {line: 229, column: 3},
				end: {line: 239, column: 20}
			},
			_p25)('Compiler is generating bad metadata. Report this at <https://github.com/elm-lang/virtual-dom/issues>.');
	} else {
		var _p28 = _p25._0;
		var _p27 = _elm_lang$virtual_dom$VirtualDom_Metadata$isPortable(_p28);
		if (_p27.ctor === 'Nothing') {
			return _elm_lang$core$Result$Ok(_p28);
		} else {
			return _elm_lang$core$Result$Err(_p27._0);
		}
	}
};

var _elm_lang$virtual_dom$VirtualDom_History$viewMessage = F3(
	function (currentIndex, index, msg) {
		var messageName = _elm_lang$virtual_dom$Native_Debug.messageToString(msg);
		var className = _elm_lang$core$Native_Utils.eq(currentIndex, index) ? 'messages-entry messages-entry-selected' : 'messages-entry';
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class(className),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$on,
						'click',
						_elm_lang$core$Json_Decode$succeed(index)),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$span,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('messages-entry-content'),
						_1: {
							ctor: '::',
							_0: A2(_elm_lang$virtual_dom$VirtualDom_Helpers$attribute, 'title', messageName),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(messageName),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$span,
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('messages-entry-index'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(
								_elm_lang$core$Basics$toString(index)),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_History$consMsg = F3(
	function (currentIndex, msg, _p0) {
		var _p1 = _p0;
		var _p2 = _p1._0;
		return {
			ctor: '_Tuple2',
			_0: _p2 - 1,
			_1: {
				ctor: '::',
				_0: A4(_elm_lang$virtual_dom$VirtualDom_Helpers$lazy3, _elm_lang$virtual_dom$VirtualDom_History$viewMessage, currentIndex, _p2, msg),
				_1: _p1._1
			}
		};
	});
var _elm_lang$virtual_dom$VirtualDom_History$viewSnapshot = F3(
	function (currentIndex, index, _p3) {
		var _p4 = _p3;
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{ctor: '[]'},
			_elm_lang$core$Tuple$second(
				A3(
					_elm_lang$core$Array$foldl,
					_elm_lang$virtual_dom$VirtualDom_History$consMsg(currentIndex),
					{
						ctor: '_Tuple2',
						_0: index - 1,
						_1: {ctor: '[]'}
					},
					_p4.messages)));
	});
var _elm_lang$virtual_dom$VirtualDom_History$undone = function (getResult) {
	var _p5 = getResult;
	if (_p5.ctor === 'Done') {
		return {ctor: '_Tuple2', _0: _p5._1, _1: _p5._0};
	} else {
		return _elm_lang$core$Native_Utils.crashCase(
			'VirtualDom.History',
			{
				start: {line: 195, column: 3},
				end: {line: 200, column: 39}
			},
			_p5)('Bug in History.get');
	}
};
var _elm_lang$virtual_dom$VirtualDom_History$elmToJs = _elm_lang$virtual_dom$Native_Debug.unsafeCoerce;
var _elm_lang$virtual_dom$VirtualDom_History$encodeHelp = F2(
	function (snapshot, allMessages) {
		return A3(
			_elm_lang$core$Array$foldl,
			F2(
				function (elm, msgs) {
					return {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_History$elmToJs(elm),
						_1: msgs
					};
				}),
			allMessages,
			snapshot.messages);
	});
var _elm_lang$virtual_dom$VirtualDom_History$encode = function (_p7) {
	var _p8 = _p7;
	var recentJson = A2(
		_elm_lang$core$List$map,
		_elm_lang$virtual_dom$VirtualDom_History$elmToJs,
		_elm_lang$core$List$reverse(_p8.recent.messages));
	return _elm_lang$core$Json_Encode$list(
		A3(_elm_lang$core$Array$foldr, _elm_lang$virtual_dom$VirtualDom_History$encodeHelp, recentJson, _p8.snapshots));
};
var _elm_lang$virtual_dom$VirtualDom_History$jsToElm = _elm_lang$virtual_dom$Native_Debug.unsafeCoerce;
var _elm_lang$virtual_dom$VirtualDom_History$initialModel = function (_p9) {
	var _p10 = _p9;
	var _p11 = A2(_elm_lang$core$Array$get, 0, _p10.snapshots);
	if (_p11.ctor === 'Just') {
		return _p11._0.model;
	} else {
		return _p10.recent.model;
	}
};
var _elm_lang$virtual_dom$VirtualDom_History$size = function (history) {
	return history.numMessages;
};
var _elm_lang$virtual_dom$VirtualDom_History$maxSnapshotSize = 64;
var _elm_lang$virtual_dom$VirtualDom_History$consSnapshot = F3(
	function (currentIndex, snapshot, _p12) {
		var _p13 = _p12;
		var _p14 = _p13._0;
		var nextIndex = _p14 - _elm_lang$virtual_dom$VirtualDom_History$maxSnapshotSize;
		var currentIndexHelp = ((_elm_lang$core$Native_Utils.cmp(nextIndex, currentIndex) < 1) && (_elm_lang$core$Native_Utils.cmp(currentIndex, _p14) < 0)) ? currentIndex : -1;
		return {
			ctor: '_Tuple2',
			_0: _p14 - _elm_lang$virtual_dom$VirtualDom_History$maxSnapshotSize,
			_1: {
				ctor: '::',
				_0: A4(_elm_lang$virtual_dom$VirtualDom_Helpers$lazy3, _elm_lang$virtual_dom$VirtualDom_History$viewSnapshot, currentIndexHelp, _p14, snapshot),
				_1: _p13._1
			}
		};
	});
var _elm_lang$virtual_dom$VirtualDom_History$viewSnapshots = F2(
	function (currentIndex, snapshots) {
		var highIndex = _elm_lang$virtual_dom$VirtualDom_History$maxSnapshotSize * _elm_lang$core$Array$length(snapshots);
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{ctor: '[]'},
			_elm_lang$core$Tuple$second(
				A3(
					_elm_lang$core$Array$foldr,
					_elm_lang$virtual_dom$VirtualDom_History$consSnapshot(currentIndex),
					{
						ctor: '_Tuple2',
						_0: highIndex,
						_1: {ctor: '[]'}
					},
					snapshots)));
	});
var _elm_lang$virtual_dom$VirtualDom_History$view = F2(
	function (maybeIndex, _p15) {
		var _p16 = _p15;
		var _p17 = function () {
			var _p18 = maybeIndex;
			if (_p18.ctor === 'Nothing') {
				return {ctor: '_Tuple2', _0: -1, _1: 'debugger-sidebar-messages'};
			} else {
				return {ctor: '_Tuple2', _0: _p18._0, _1: 'debugger-sidebar-messages-paused'};
			}
		}();
		var index = _p17._0;
		var className = _p17._1;
		var oldStuff = A3(_elm_lang$virtual_dom$VirtualDom_Helpers$lazy2, _elm_lang$virtual_dom$VirtualDom_History$viewSnapshots, index, _p16.snapshots);
		var newStuff = _elm_lang$core$Tuple$second(
			A3(
				_elm_lang$core$List$foldl,
				_elm_lang$virtual_dom$VirtualDom_History$consMsg(index),
				{
					ctor: '_Tuple2',
					_0: _p16.numMessages - 1,
					_1: {ctor: '[]'}
				},
				_p16.recent.messages));
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class(className),
				_1: {ctor: '[]'}
			},
			{ctor: '::', _0: oldStuff, _1: newStuff});
	});
var _elm_lang$virtual_dom$VirtualDom_History$History = F3(
	function (a, b, c) {
		return {snapshots: a, recent: b, numMessages: c};
	});
var _elm_lang$virtual_dom$VirtualDom_History$RecentHistory = F3(
	function (a, b, c) {
		return {model: a, messages: b, numMessages: c};
	});
var _elm_lang$virtual_dom$VirtualDom_History$empty = function (model) {
	return A3(
		_elm_lang$virtual_dom$VirtualDom_History$History,
		_elm_lang$core$Array$empty,
		A3(
			_elm_lang$virtual_dom$VirtualDom_History$RecentHistory,
			model,
			{ctor: '[]'},
			0),
		0);
};
var _elm_lang$virtual_dom$VirtualDom_History$Snapshot = F2(
	function (a, b) {
		return {model: a, messages: b};
	});
var _elm_lang$virtual_dom$VirtualDom_History$addRecent = F3(
	function (msg, newModel, _p19) {
		var _p20 = _p19;
		var _p23 = _p20.numMessages;
		var _p22 = _p20.model;
		var _p21 = _p20.messages;
		return _elm_lang$core$Native_Utils.eq(_p23, _elm_lang$virtual_dom$VirtualDom_History$maxSnapshotSize) ? {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Maybe$Just(
				A2(
					_elm_lang$virtual_dom$VirtualDom_History$Snapshot,
					_p22,
					_elm_lang$core$Array$fromList(_p21))),
			_1: A3(
				_elm_lang$virtual_dom$VirtualDom_History$RecentHistory,
				newModel,
				{
					ctor: '::',
					_0: msg,
					_1: {ctor: '[]'}
				},
				1)
		} : {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Maybe$Nothing,
			_1: A3(
				_elm_lang$virtual_dom$VirtualDom_History$RecentHistory,
				_p22,
				{ctor: '::', _0: msg, _1: _p21},
				_p23 + 1)
		};
	});
var _elm_lang$virtual_dom$VirtualDom_History$add = F3(
	function (msg, model, _p24) {
		var _p25 = _p24;
		var _p28 = _p25.snapshots;
		var _p27 = _p25.numMessages;
		var _p26 = A3(_elm_lang$virtual_dom$VirtualDom_History$addRecent, msg, model, _p25.recent);
		if (_p26._0.ctor === 'Just') {
			return A3(
				_elm_lang$virtual_dom$VirtualDom_History$History,
				A2(_elm_lang$core$Array$push, _p26._0._0, _p28),
				_p26._1,
				_p27 + 1);
		} else {
			return A3(_elm_lang$virtual_dom$VirtualDom_History$History, _p28, _p26._1, _p27 + 1);
		}
	});
var _elm_lang$virtual_dom$VirtualDom_History$decoder = F2(
	function (initialModel, update) {
		var addMessage = F2(
			function (rawMsg, _p29) {
				var _p30 = _p29;
				var _p31 = _p30._0;
				var msg = _elm_lang$virtual_dom$VirtualDom_History$jsToElm(rawMsg);
				return {
					ctor: '_Tuple2',
					_0: A2(update, msg, _p31),
					_1: A3(_elm_lang$virtual_dom$VirtualDom_History$add, msg, _p31, _p30._1)
				};
			});
		var updateModel = function (rawMsgs) {
			return A3(
				_elm_lang$core$List$foldl,
				addMessage,
				{
					ctor: '_Tuple2',
					_0: initialModel,
					_1: _elm_lang$virtual_dom$VirtualDom_History$empty(initialModel)
				},
				rawMsgs);
		};
		return A2(
			_elm_lang$core$Json_Decode$map,
			updateModel,
			_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$value));
	});
var _elm_lang$virtual_dom$VirtualDom_History$Done = F2(
	function (a, b) {
		return {ctor: 'Done', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_History$Stepping = F2(
	function (a, b) {
		return {ctor: 'Stepping', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_History$getHelp = F3(
	function (update, msg, getResult) {
		var _p32 = getResult;
		if (_p32.ctor === 'Done') {
			return getResult;
		} else {
			var _p34 = _p32._0;
			var _p33 = _p32._1;
			return _elm_lang$core$Native_Utils.eq(_p34, 0) ? A2(
				_elm_lang$virtual_dom$VirtualDom_History$Done,
				msg,
				_elm_lang$core$Tuple$first(
					A2(update, msg, _p33))) : A2(
				_elm_lang$virtual_dom$VirtualDom_History$Stepping,
				_p34 - 1,
				_elm_lang$core$Tuple$first(
					A2(update, msg, _p33)));
		}
	});
var _elm_lang$virtual_dom$VirtualDom_History$get = F3(
	function (update, index, _p35) {
		var _p36 = _p35;
		var _p39 = _p36.recent;
		var snapshotMax = _p36.numMessages - _p39.numMessages;
		if (_elm_lang$core$Native_Utils.cmp(index, snapshotMax) > -1) {
			return _elm_lang$virtual_dom$VirtualDom_History$undone(
				A3(
					_elm_lang$core$List$foldr,
					_elm_lang$virtual_dom$VirtualDom_History$getHelp(update),
					A2(_elm_lang$virtual_dom$VirtualDom_History$Stepping, index - snapshotMax, _p39.model),
					_p39.messages));
		} else {
			var _p37 = A2(_elm_lang$core$Array$get, (index / _elm_lang$virtual_dom$VirtualDom_History$maxSnapshotSize) | 0, _p36.snapshots);
			if (_p37.ctor === 'Nothing') {
				return _elm_lang$core$Native_Utils.crashCase(
					'VirtualDom.History',
					{
						start: {line: 165, column: 7},
						end: {line: 171, column: 95}
					},
					_p37)('UI should only let you ask for real indexes!');
			} else {
				return _elm_lang$virtual_dom$VirtualDom_History$undone(
					A3(
						_elm_lang$core$Array$foldr,
						_elm_lang$virtual_dom$VirtualDom_History$getHelp(update),
						A2(
							_elm_lang$virtual_dom$VirtualDom_History$Stepping,
							A2(_elm_lang$core$Basics$rem, index, _elm_lang$virtual_dom$VirtualDom_History$maxSnapshotSize),
							_p37._0.model),
						_p37._0.messages));
			}
		}
	});

var _elm_lang$virtual_dom$VirtualDom_Overlay$styles = A3(
	_elm_lang$virtual_dom$VirtualDom_Helpers$node,
	'style',
	{ctor: '[]'},
	{
		ctor: '::',
		_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('\n\n.elm-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  color: white;\n  pointer-events: none;\n  font-family: \'Trebuchet MS\', \'Lucida Grande\', \'Bitstream Vera Sans\', \'Helvetica Neue\', sans-serif;\n}\n\n.elm-overlay-resume {\n  width: 100%;\n  height: 100%;\n  cursor: pointer;\n  text-align: center;\n  pointer-events: auto;\n  background-color: rgba(200, 200, 200, 0.7);\n}\n\n.elm-overlay-resume-words {\n  position: absolute;\n  top: calc(50% - 40px);\n  font-size: 80px;\n  line-height: 80px;\n  height: 80px;\n  width: 100%;\n}\n\n.elm-mini-controls {\n  position: fixed;\n  bottom: 0;\n  right: 6px;\n  border-radius: 4px;\n  background-color: rgb(61, 61, 61);\n  font-family: monospace;\n  pointer-events: auto;\n}\n\n.elm-mini-controls-button {\n  padding: 6px;\n  cursor: pointer;\n  text-align: center;\n  min-width: 24ch;\n}\n\n.elm-mini-controls-import-export {\n  padding: 4px 0;\n  font-size: 0.8em;\n  text-align: center;\n  background-color: rgb(50, 50, 50);\n}\n\n.elm-overlay-message {\n  position: absolute;\n  width: 600px;\n  height: 100%;\n  padding-left: calc(50% - 300px);\n  padding-right: calc(50% - 300px);\n  background-color: rgba(200, 200, 200, 0.7);\n  pointer-events: auto;\n}\n\n.elm-overlay-message-title {\n  font-size: 36px;\n  height: 80px;\n  background-color: rgb(50, 50, 50);\n  padding-left: 22px;\n  vertical-align: middle;\n  line-height: 80px;\n}\n\n.elm-overlay-message-details {\n  padding: 8px 20px;\n  overflow-y: auto;\n  max-height: calc(100% - 156px);\n  background-color: rgb(61, 61, 61);\n}\n\n.elm-overlay-message-details-type {\n  font-size: 1.5em;\n}\n\n.elm-overlay-message-details ul {\n  list-style-type: none;\n  padding-left: 20px;\n}\n\n.elm-overlay-message-details ul ul {\n  list-style-type: disc;\n  padding-left: 2em;\n}\n\n.elm-overlay-message-details li {\n  margin: 8px 0;\n}\n\n.elm-overlay-message-buttons {\n  height: 60px;\n  line-height: 60px;\n  text-align: right;\n  background-color: rgb(50, 50, 50);\n}\n\n.elm-overlay-message-buttons button {\n  margin-right: 20px;\n}\n\n'),
		_1: {ctor: '[]'}
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$button = F2(
	function (msg, label) {
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$span,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(msg),
				_1: {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'cursor', _1: 'pointer'},
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(label),
				_1: {ctor: '[]'}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewImportExport = F3(
	function (props, importMsg, exportMsg) {
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			props,
			{
				ctor: '::',
				_0: A2(_elm_lang$virtual_dom$VirtualDom_Overlay$button, importMsg, 'Import'),
				_1: {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' / '),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$virtual_dom$VirtualDom_Overlay$button, exportMsg, 'Export'),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewMiniControls = F2(
	function (config, numMsgs) {
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-mini-controls'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(config.open),
						_1: {
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-mini-controls-button'),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'Explore History (',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(numMsgs),
									')'))),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A3(
						_elm_lang$virtual_dom$VirtualDom_Overlay$viewImportExport,
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-mini-controls-import-export'),
							_1: {ctor: '[]'}
						},
						config.importHistory,
						config.exportHistory),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$addCommas = function (items) {
	var _p0 = items;
	if (_p0.ctor === '[]') {
		return '';
	} else {
		if (_p0._1.ctor === '[]') {
			return _p0._0;
		} else {
			if (_p0._1._1.ctor === '[]') {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					_p0._0,
					A2(_elm_lang$core$Basics_ops['++'], ' and ', _p0._1._0));
			} else {
				return A2(
					_elm_lang$core$String$join,
					', ',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_p0._1,
						{
							ctor: '::',
							_0: A2(_elm_lang$core$Basics_ops['++'], ' and ', _p0._0),
							_1: {ctor: '[]'}
						}));
			}
		}
	}
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$problemToString = function (problem) {
	var _p1 = problem;
	switch (_p1.ctor) {
		case 'Function':
			return 'functions';
		case 'Decoder':
			return 'JSON decoders';
		case 'Task':
			return 'tasks';
		case 'Process':
			return 'processes';
		case 'Socket':
			return 'web sockets';
		case 'Request':
			return 'HTTP requests';
		case 'Program':
			return 'programs';
		default:
			return 'virtual DOM values';
	}
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$goodNews2 = '\nfunction can pattern match on that data and call whatever functions, JSON\ndecoders, etc. you need. This makes the code much more explicit and easy to\nfollow for other readers (or you in a few months!)\n';
var _elm_lang$virtual_dom$VirtualDom_Overlay$goodNews1 = '\nThe good news is that having values like this in your message type is not\nso great in the long run. You are better off using simpler data, like\n';
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode = function (name) {
	return A3(
		_elm_lang$virtual_dom$VirtualDom_Helpers$node,
		'code',
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(name),
			_1: {ctor: '[]'}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewMention = F2(
	function (tags, verbed) {
		var _p2 = A2(
			_elm_lang$core$List$map,
			_elm_lang$virtual_dom$VirtualDom_Overlay$viewCode,
			_elm_lang$core$List$reverse(tags));
		if (_p2.ctor === '[]') {
			return _elm_lang$virtual_dom$VirtualDom_Helpers$text('');
		} else {
			if (_p2._1.ctor === '[]') {
				return A3(
					_elm_lang$virtual_dom$VirtualDom_Helpers$node,
					'li',
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(verbed),
						_1: {
							ctor: '::',
							_0: _p2._0,
							_1: {
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('.'),
								_1: {ctor: '[]'}
							}
						}
					});
			} else {
				if (_p2._1._1.ctor === '[]') {
					return A3(
						_elm_lang$virtual_dom$VirtualDom_Helpers$node,
						'li',
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(verbed),
							_1: {
								ctor: '::',
								_0: _p2._1._0,
								_1: {
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' and '),
									_1: {
										ctor: '::',
										_0: _p2._0,
										_1: {
											ctor: '::',
											_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('.'),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						});
				} else {
					return A3(
						_elm_lang$virtual_dom$VirtualDom_Helpers$node,
						'li',
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(verbed),
							_1: A2(
								_elm_lang$core$Basics_ops['++'],
								A2(
									_elm_lang$core$List$intersperse,
									_elm_lang$virtual_dom$VirtualDom_Helpers$text(', '),
									_elm_lang$core$List$reverse(_p2._1)),
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(', and '),
									_1: {
										ctor: '::',
										_0: _p2._0,
										_1: {
											ctor: '::',
											_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('.'),
											_1: {ctor: '[]'}
										}
									}
								})
						});
				}
			}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewChange = function (change) {
	return A3(
		_elm_lang$virtual_dom$VirtualDom_Helpers$node,
		'li',
		{ctor: '[]'},
		function () {
			var _p3 = change;
			if (_p3.ctor === 'AliasChange') {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$span,
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-message-details-type'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode(_p3._0),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				};
			} else {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$span,
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-message-details-type'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode(_p3._0),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A3(
							_elm_lang$virtual_dom$VirtualDom_Helpers$node,
							'ul',
							{ctor: '[]'},
							{
								ctor: '::',
								_0: A2(_elm_lang$virtual_dom$VirtualDom_Overlay$viewMention, _p3._1.removed, 'Removed '),
								_1: {
									ctor: '::',
									_0: A2(_elm_lang$virtual_dom$VirtualDom_Overlay$viewMention, _p3._1.changed, 'Changed '),
									_1: {
										ctor: '::',
										_0: A2(_elm_lang$virtual_dom$VirtualDom_Overlay$viewMention, _p3._1.added, 'Added '),
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {
							ctor: '::',
							_0: _p3._1.argsMatch ? _elm_lang$virtual_dom$VirtualDom_Helpers$text('') : _elm_lang$virtual_dom$VirtualDom_Helpers$text('This may be due to the fact that the type variable names changed.'),
							_1: {ctor: '[]'}
						}
					}
				};
			}
		}());
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewProblemType = function (_p4) {
	var _p5 = _p4;
	return A3(
		_elm_lang$virtual_dom$VirtualDom_Helpers$node,
		'li',
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode(_p5.name),
			_1: {
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(
					A2(
						_elm_lang$core$Basics_ops['++'],
						' can contain ',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$virtual_dom$VirtualDom_Overlay$addCommas(
								A2(_elm_lang$core$List$map, _elm_lang$virtual_dom$VirtualDom_Overlay$problemToString, _p5.problems)),
							'.'))),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewBadMetadata = function (_p6) {
	var _p7 = _p6;
	return {
		ctor: '::',
		_0: A3(
			_elm_lang$virtual_dom$VirtualDom_Helpers$node,
			'p',
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('The '),
				_1: {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode(_p7.message),
					_1: {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' type of your program cannot be reliably serialized for history files.'),
						_1: {ctor: '[]'}
					}
				}
			}),
		_1: {
			ctor: '::',
			_0: A3(
				_elm_lang$virtual_dom$VirtualDom_Helpers$node,
				'p',
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('Functions cannot be serialized, nor can values that contain functions. This is a problem in these places:'),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A3(
					_elm_lang$virtual_dom$VirtualDom_Helpers$node,
					'ul',
					{ctor: '[]'},
					A2(_elm_lang$core$List$map, _elm_lang$virtual_dom$VirtualDom_Overlay$viewProblemType, _p7.problems)),
				_1: {
					ctor: '::',
					_0: A3(
						_elm_lang$virtual_dom$VirtualDom_Helpers$node,
						'p',
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_elm_lang$virtual_dom$VirtualDom_Overlay$goodNews1),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$a,
									{
										ctor: '::',
										_0: _elm_lang$virtual_dom$VirtualDom_Helpers$href('https://guide.elm-lang.org/types/union_types.html'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('union types'),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(', in your messages. From there, your '),
									_1: {
										ctor: '::',
										_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode('update'),
										_1: {
											ctor: '::',
											_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_elm_lang$virtual_dom$VirtualDom_Overlay$goodNews2),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}),
					_1: {ctor: '[]'}
				}
			}
		}
	};
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$explanationRisky = '\nThis history seems old. It will work with this program, but some\nmessages have been added since the history was created:\n';
var _elm_lang$virtual_dom$VirtualDom_Overlay$explanationBad = '\nThe messages in this history do not match the messages handled by your\nprogram. I noticed changes in the following types:\n';
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewReport = F2(
	function (isBad, report) {
		var _p8 = report;
		switch (_p8.ctor) {
			case 'CorruptHistory':
				return {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('Looks like this history file is corrupt. I cannot understand it.'),
					_1: {ctor: '[]'}
				};
			case 'VersionChanged':
				return {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(
						A2(
							_elm_lang$core$Basics_ops['++'],
							'This history was created with Elm ',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_p8._0,
								A2(
									_elm_lang$core$Basics_ops['++'],
									', but you are using Elm ',
									A2(_elm_lang$core$Basics_ops['++'], _p8._1, ' right now.'))))),
					_1: {ctor: '[]'}
				};
			case 'MessageChanged':
				return {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(
						A2(_elm_lang$core$Basics_ops['++'], 'To import some other history, the overall message type must', ' be the same. The old history has ')),
					_1: {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode(_p8._0),
						_1: {
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' messages, but the new program works with '),
							_1: {
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode(_p8._1),
								_1: {
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' messages.'),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				};
			default:
				return {
					ctor: '::',
					_0: A3(
						_elm_lang$virtual_dom$VirtualDom_Helpers$node,
						'p',
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(
								isBad ? _elm_lang$virtual_dom$VirtualDom_Overlay$explanationBad : _elm_lang$virtual_dom$VirtualDom_Overlay$explanationRisky),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A3(
							_elm_lang$virtual_dom$VirtualDom_Helpers$node,
							'ul',
							{ctor: '[]'},
							A2(_elm_lang$core$List$map, _elm_lang$virtual_dom$VirtualDom_Overlay$viewChange, _p8._0)),
						_1: {ctor: '[]'}
					}
				};
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewResume = function (config) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-resume'),
			_1: {
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(config.resume),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$virtual_dom$VirtualDom_Helpers$div,
				{
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-resume-words'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('Click to Resume'),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$uploadDecoder = A3(
	_elm_lang$core$Json_Decode$map2,
	F2(
		function (v0, v1) {
			return {ctor: '_Tuple2', _0: v0, _1: v1};
		}),
	A2(_elm_lang$core$Json_Decode$field, 'metadata', _elm_lang$virtual_dom$VirtualDom_Metadata$decoder),
	A2(_elm_lang$core$Json_Decode$field, 'history', _elm_lang$core$Json_Decode$value));
var _elm_lang$virtual_dom$VirtualDom_Overlay$close = F2(
	function (msg, state) {
		var _p9 = state;
		switch (_p9.ctor) {
			case 'None':
				return _elm_lang$core$Maybe$Nothing;
			case 'BadMetadata':
				return _elm_lang$core$Maybe$Nothing;
			case 'BadImport':
				return _elm_lang$core$Maybe$Nothing;
			default:
				var _p10 = msg;
				if (_p10.ctor === 'Cancel') {
					return _elm_lang$core$Maybe$Nothing;
				} else {
					return _elm_lang$core$Maybe$Just(_p9._1);
				}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$isBlocking = function (state) {
	var _p11 = state;
	if (_p11.ctor === 'None') {
		return false;
	} else {
		return true;
	}
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$Config = F5(
	function (a, b, c, d, e) {
		return {resume: a, open: b, importHistory: c, exportHistory: d, wrap: e};
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$RiskyImport = F2(
	function (a, b) {
		return {ctor: 'RiskyImport', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$BadImport = function (a) {
	return {ctor: 'BadImport', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$corruptImport = _elm_lang$virtual_dom$VirtualDom_Overlay$BadImport(_elm_lang$virtual_dom$VirtualDom_Report$CorruptHistory);
var _elm_lang$virtual_dom$VirtualDom_Overlay$assessImport = F2(
	function (metadata, jsonString) {
		var _p12 = A2(_elm_lang$core$Json_Decode$decodeString, _elm_lang$virtual_dom$VirtualDom_Overlay$uploadDecoder, jsonString);
		if (_p12.ctor === 'Err') {
			return _elm_lang$core$Result$Err(_elm_lang$virtual_dom$VirtualDom_Overlay$corruptImport);
		} else {
			var _p14 = _p12._0._1;
			var report = A2(_elm_lang$virtual_dom$VirtualDom_Metadata$check, _p12._0._0, metadata);
			var _p13 = _elm_lang$virtual_dom$VirtualDom_Report$evaluate(report);
			switch (_p13.ctor) {
				case 'Impossible':
					return _elm_lang$core$Result$Err(
						_elm_lang$virtual_dom$VirtualDom_Overlay$BadImport(report));
				case 'Risky':
					return _elm_lang$core$Result$Err(
						A2(_elm_lang$virtual_dom$VirtualDom_Overlay$RiskyImport, report, _p14));
				default:
					return _elm_lang$core$Result$Ok(_p14);
			}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$BadMetadata = function (a) {
	return {ctor: 'BadMetadata', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$badMetadata = _elm_lang$virtual_dom$VirtualDom_Overlay$BadMetadata;
var _elm_lang$virtual_dom$VirtualDom_Overlay$None = {ctor: 'None'};
var _elm_lang$virtual_dom$VirtualDom_Overlay$none = _elm_lang$virtual_dom$VirtualDom_Overlay$None;
var _elm_lang$virtual_dom$VirtualDom_Overlay$Proceed = {ctor: 'Proceed'};
var _elm_lang$virtual_dom$VirtualDom_Overlay$Cancel = {ctor: 'Cancel'};
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewButtons = function (buttons) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-message-buttons'),
			_1: {ctor: '[]'}
		},
		function () {
			var _p15 = buttons;
			if (_p15.ctor === 'Accept') {
				return {
					ctor: '::',
					_0: A3(
						_elm_lang$virtual_dom$VirtualDom_Helpers$node,
						'button',
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Overlay$Proceed),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p15._0),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				};
			} else {
				return {
					ctor: '::',
					_0: A3(
						_elm_lang$virtual_dom$VirtualDom_Helpers$node,
						'button',
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Overlay$Cancel),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p15._0),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A3(
							_elm_lang$virtual_dom$VirtualDom_Helpers$node,
							'button',
							{
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Overlay$Proceed),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p15._1),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				};
			}
		}());
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$Message = {ctor: 'Message'};
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewMessage = F4(
	function (config, title, details, buttons) {
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$virtual_dom$VirtualDom_Overlay$Message,
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-message'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$virtual_dom$VirtualDom_Helpers$div,
							{
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-message-title'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(title),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$div,
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-message-details'),
									_1: {ctor: '[]'}
								},
								details),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$map,
									config.wrap,
									_elm_lang$virtual_dom$VirtualDom_Overlay$viewButtons(buttons)),
								_1: {ctor: '[]'}
							}
						}
					}),
				_1: {ctor: '[]'}
			}
		};
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$Pause = {ctor: 'Pause'};
var _elm_lang$virtual_dom$VirtualDom_Overlay$Normal = {ctor: 'Normal'};
var _elm_lang$virtual_dom$VirtualDom_Overlay$Choose = F2(
	function (a, b) {
		return {ctor: 'Choose', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$Accept = function (a) {
	return {ctor: 'Accept', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewHelp = F5(
	function (config, isPaused, isOpen, numMsgs, state) {
		var _p16 = state;
		switch (_p16.ctor) {
			case 'None':
				var miniControls = isOpen ? {ctor: '[]'} : {
					ctor: '::',
					_0: A2(_elm_lang$virtual_dom$VirtualDom_Overlay$viewMiniControls, config, numMsgs),
					_1: {ctor: '[]'}
				};
				return {
					ctor: '_Tuple2',
					_0: isPaused ? _elm_lang$virtual_dom$VirtualDom_Overlay$Pause : _elm_lang$virtual_dom$VirtualDom_Overlay$Normal,
					_1: (isPaused && (!isOpen)) ? {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewResume(config),
						_1: miniControls
					} : miniControls
				};
			case 'BadMetadata':
				return A4(
					_elm_lang$virtual_dom$VirtualDom_Overlay$viewMessage,
					config,
					'Cannot use Import or Export',
					_elm_lang$virtual_dom$VirtualDom_Overlay$viewBadMetadata(_p16._0),
					_elm_lang$virtual_dom$VirtualDom_Overlay$Accept('Ok'));
			case 'BadImport':
				return A4(
					_elm_lang$virtual_dom$VirtualDom_Overlay$viewMessage,
					config,
					'Cannot Import History',
					A2(_elm_lang$virtual_dom$VirtualDom_Overlay$viewReport, true, _p16._0),
					_elm_lang$virtual_dom$VirtualDom_Overlay$Accept('Ok'));
			default:
				return A4(
					_elm_lang$virtual_dom$VirtualDom_Overlay$viewMessage,
					config,
					'Warning',
					A2(_elm_lang$virtual_dom$VirtualDom_Overlay$viewReport, false, _p16._0),
					A2(_elm_lang$virtual_dom$VirtualDom_Overlay$Choose, 'Cancel', 'Import Anyway'));
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$view = F5(
	function (config, isPaused, isOpen, numMsgs, state) {
		var _p17 = A5(_elm_lang$virtual_dom$VirtualDom_Overlay$viewHelp, config, isPaused, isOpen, numMsgs, state);
		var block = _p17._0;
		var nodes = _p17._1;
		return {
			ctor: '_Tuple2',
			_0: block,
			_1: A2(
				_elm_lang$virtual_dom$VirtualDom_Helpers$div,
				{
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay'),
					_1: {ctor: '[]'}
				},
				{ctor: '::', _0: _elm_lang$virtual_dom$VirtualDom_Overlay$styles, _1: nodes})
		};
	});

var _elm_lang$virtual_dom$VirtualDom_Debug$styles = A3(
	_elm_lang$virtual_dom$VirtualDom_Helpers$node,
	'style',
	{ctor: '[]'},
	{
		ctor: '::',
		_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('\n\nhtml {\n    overflow: hidden;\n    height: 100%;\n}\n\nbody {\n    height: 100%;\n    overflow: auto;\n}\n\n#debugger {\n  width: 100%\n  height: 100%;\n  font-family: monospace;\n}\n\n#values {\n  display: block;\n  float: left;\n  height: 100%;\n  width: calc(100% - 30ch);\n  margin: 0;\n  overflow: auto;\n  cursor: default;\n}\n\n.debugger-sidebar {\n  display: block;\n  float: left;\n  width: 30ch;\n  height: 100%;\n  color: white;\n  background-color: rgb(61, 61, 61);\n}\n\n.debugger-sidebar-controls {\n  width: 100%;\n  text-align: center;\n  background-color: rgb(50, 50, 50);\n}\n\n.debugger-sidebar-controls-import-export {\n  width: 100%;\n  height: 24px;\n  line-height: 24px;\n  font-size: 12px;\n}\n\n.debugger-sidebar-controls-resume {\n  width: 100%;\n  height: 30px;\n  line-height: 30px;\n  cursor: pointer;\n}\n\n.debugger-sidebar-controls-resume:hover {\n  background-color: rgb(41, 41, 41);\n}\n\n.debugger-sidebar-messages {\n  width: 100%;\n  overflow-y: auto;\n  height: calc(100% - 24px);\n}\n\n.debugger-sidebar-messages-paused {\n  width: 100%;\n  overflow-y: auto;\n  height: calc(100% - 54px);\n}\n\n.messages-entry {\n  cursor: pointer;\n  width: 100%;\n}\n\n.messages-entry:hover {\n  background-color: rgb(41, 41, 41);\n}\n\n.messages-entry-selected, .messages-entry-selected:hover {\n  background-color: rgb(10, 10, 10);\n}\n\n.messages-entry-content {\n  width: calc(100% - 7ch);\n  padding-top: 4px;\n  padding-bottom: 4px;\n  padding-left: 1ch;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  display: inline-block;\n}\n\n.messages-entry-index {\n  color: #666;\n  width: 5ch;\n  padding-top: 4px;\n  padding-bottom: 4px;\n  padding-right: 1ch;\n  text-align: right;\n  display: block;\n  float: right;\n}\n\n'),
		_1: {ctor: '[]'}
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$button = F2(
	function (msg, label) {
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$span,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(msg),
				_1: {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'cursor', _1: 'pointer'},
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(label),
				_1: {ctor: '[]'}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$getLatestModel = function (state) {
	var _p0 = state;
	if (_p0.ctor === 'Running') {
		return _p0._0;
	} else {
		return _p0._2;
	}
};
var _elm_lang$virtual_dom$VirtualDom_Debug$withGoodMetadata = F2(
	function (model, func) {
		var _p1 = model.metadata;
		if (_p1.ctor === 'Ok') {
			return func(_p1._0);
		} else {
			return A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_elm_lang$core$Native_Utils.update(
					model,
					{
						overlay: _elm_lang$virtual_dom$VirtualDom_Overlay$badMetadata(_p1._0)
					}),
				{ctor: '[]'});
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$Model = F6(
	function (a, b, c, d, e, f) {
		return {history: a, state: b, expando: c, metadata: d, overlay: e, isDebuggerOpen: f};
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$Paused = F3(
	function (a, b, c) {
		return {ctor: 'Paused', _0: a, _1: b, _2: c};
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$Running = function (a) {
	return {ctor: 'Running', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Debug$loadNewHistory = F3(
	function (rawHistory, userUpdate, model) {
		var pureUserUpdate = F2(
			function (msg, userModel) {
				return _elm_lang$core$Tuple$first(
					A2(userUpdate, msg, userModel));
			});
		var initialUserModel = _elm_lang$virtual_dom$VirtualDom_History$initialModel(model.history);
		var decoder = A2(_elm_lang$virtual_dom$VirtualDom_History$decoder, initialUserModel, pureUserUpdate);
		var _p2 = A2(_elm_lang$core$Json_Decode$decodeValue, decoder, rawHistory);
		if (_p2.ctor === 'Err') {
			return A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_elm_lang$core$Native_Utils.update(
					model,
					{overlay: _elm_lang$virtual_dom$VirtualDom_Overlay$corruptImport}),
				{ctor: '[]'});
		} else {
			var _p3 = _p2._0._0;
			return A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_elm_lang$core$Native_Utils.update(
					model,
					{
						history: _p2._0._1,
						state: _elm_lang$virtual_dom$VirtualDom_Debug$Running(_p3),
						expando: _elm_lang$virtual_dom$VirtualDom_Expando$init(_p3),
						overlay: _elm_lang$virtual_dom$VirtualDom_Overlay$none
					}),
				{ctor: '[]'});
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$OverlayMsg = function (a) {
	return {ctor: 'OverlayMsg', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Debug$Upload = function (a) {
	return {ctor: 'Upload', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Debug$upload = A2(_elm_lang$core$Task$perform, _elm_lang$virtual_dom$VirtualDom_Debug$Upload, _elm_lang$virtual_dom$Native_Debug.upload);
var _elm_lang$virtual_dom$VirtualDom_Debug$Export = {ctor: 'Export'};
var _elm_lang$virtual_dom$VirtualDom_Debug$Import = {ctor: 'Import'};
var _elm_lang$virtual_dom$VirtualDom_Debug$Down = {ctor: 'Down'};
var _elm_lang$virtual_dom$VirtualDom_Debug$Up = {ctor: 'Up'};
var _elm_lang$virtual_dom$VirtualDom_Debug$Close = {ctor: 'Close'};
var _elm_lang$virtual_dom$VirtualDom_Debug$Open = {ctor: 'Open'};
var _elm_lang$virtual_dom$VirtualDom_Debug$Jump = function (a) {
	return {ctor: 'Jump', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Debug$Resume = {ctor: 'Resume'};
var _elm_lang$virtual_dom$VirtualDom_Debug$overlayConfig = {resume: _elm_lang$virtual_dom$VirtualDom_Debug$Resume, open: _elm_lang$virtual_dom$VirtualDom_Debug$Open, importHistory: _elm_lang$virtual_dom$VirtualDom_Debug$Import, exportHistory: _elm_lang$virtual_dom$VirtualDom_Debug$Export, wrap: _elm_lang$virtual_dom$VirtualDom_Debug$OverlayMsg};
var _elm_lang$virtual_dom$VirtualDom_Debug$viewIn = function (_p4) {
	var _p5 = _p4;
	var isPaused = function () {
		var _p6 = _p5.state;
		if (_p6.ctor === 'Running') {
			return false;
		} else {
			return true;
		}
	}();
	return A5(
		_elm_lang$virtual_dom$VirtualDom_Overlay$view,
		_elm_lang$virtual_dom$VirtualDom_Debug$overlayConfig,
		isPaused,
		_p5.isDebuggerOpen,
		_elm_lang$virtual_dom$VirtualDom_History$size(_p5.history),
		_p5.overlay);
};
var _elm_lang$virtual_dom$VirtualDom_Debug$resumeButton = A2(
	_elm_lang$virtual_dom$VirtualDom_Helpers$div,
	{
		ctor: '::',
		_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Debug$Resume),
		_1: {
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('debugger-sidebar-controls-resume'),
			_1: {ctor: '[]'}
		}
	},
	{
		ctor: '::',
		_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('Resume'),
		_1: {ctor: '[]'}
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$viewResumeButton = function (maybeIndex) {
	var _p7 = maybeIndex;
	if (_p7.ctor === 'Nothing') {
		return _elm_lang$virtual_dom$VirtualDom_Helpers$text('');
	} else {
		return _elm_lang$virtual_dom$VirtualDom_Debug$resumeButton;
	}
};
var _elm_lang$virtual_dom$VirtualDom_Debug$playButton = function (maybeIndex) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('debugger-sidebar-controls'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Debug$viewResumeButton(maybeIndex),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('debugger-sidebar-controls-import-export'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(_elm_lang$virtual_dom$VirtualDom_Debug$button, _elm_lang$virtual_dom$VirtualDom_Debug$Import, 'Import'),
						_1: {
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' / '),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$virtual_dom$VirtualDom_Debug$button, _elm_lang$virtual_dom$VirtualDom_Debug$Export, 'Export'),
								_1: {ctor: '[]'}
							}
						}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Debug$viewSidebar = F2(
	function (state, history) {
		var maybeIndex = function () {
			var _p8 = state;
			if (_p8.ctor === 'Running') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				return _elm_lang$core$Maybe$Just(_p8._0);
			}
		}();
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('debugger-sidebar'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$map,
					_elm_lang$virtual_dom$VirtualDom_Debug$Jump,
					A2(_elm_lang$virtual_dom$VirtualDom_History$view, maybeIndex, history)),
				_1: {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Debug$playButton(maybeIndex),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$ExpandoMsg = function (a) {
	return {ctor: 'ExpandoMsg', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Debug$viewOut = function (_p9) {
	var _p10 = _p9;
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$id('debugger'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Debug$styles,
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$virtual_dom$VirtualDom_Debug$viewSidebar, _p10.state, _p10.history),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$map,
						_elm_lang$virtual_dom$VirtualDom_Debug$ExpandoMsg,
						A2(
							_elm_lang$virtual_dom$VirtualDom_Helpers$div,
							{
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Helpers$id('values'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(_elm_lang$virtual_dom$VirtualDom_Expando$view, _elm_lang$core$Maybe$Nothing, _p10.expando),
								_1: {ctor: '[]'}
							})),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Debug$UserMsg = function (a) {
	return {ctor: 'UserMsg', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapInit = F2(
	function (metadata, _p11) {
		var _p12 = _p11;
		var _p13 = _p12._0;
		return A2(
			_elm_lang$core$Platform_Cmd_ops['!'],
			{
				history: _elm_lang$virtual_dom$VirtualDom_History$empty(_p13),
				state: _elm_lang$virtual_dom$VirtualDom_Debug$Running(_p13),
				expando: _elm_lang$virtual_dom$VirtualDom_Expando$init(_p13),
				metadata: _elm_lang$virtual_dom$VirtualDom_Metadata$decode(metadata),
				overlay: _elm_lang$virtual_dom$VirtualDom_Overlay$none,
				isDebuggerOpen: false
			},
			{
				ctor: '::',
				_0: A2(_elm_lang$core$Platform_Cmd$map, _elm_lang$virtual_dom$VirtualDom_Debug$UserMsg, _p12._1),
				_1: {ctor: '[]'}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapSubs = F2(
	function (userSubscriptions, _p14) {
		var _p15 = _p14;
		return A2(
			_elm_lang$core$Platform_Sub$map,
			_elm_lang$virtual_dom$VirtualDom_Debug$UserMsg,
			userSubscriptions(
				_elm_lang$virtual_dom$VirtualDom_Debug$getLatestModel(_p15.state)));
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapView = F2(
	function (userView, _p16) {
		var _p17 = _p16;
		var currentModel = function () {
			var _p18 = _p17.state;
			if (_p18.ctor === 'Running') {
				return _p18._0;
			} else {
				return _p18._1;
			}
		}();
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$map,
			_elm_lang$virtual_dom$VirtualDom_Debug$UserMsg,
			userView(currentModel));
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$NoOp = {ctor: 'NoOp'};
var _elm_lang$virtual_dom$VirtualDom_Debug$download = F2(
	function (metadata, history) {
		var json = _elm_lang$core$Json_Encode$object(
			{
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'metadata',
					_1: _elm_lang$virtual_dom$VirtualDom_Metadata$encode(metadata)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'history',
						_1: _elm_lang$virtual_dom$VirtualDom_History$encode(history)
					},
					_1: {ctor: '[]'}
				}
			});
		var historyLength = _elm_lang$virtual_dom$VirtualDom_History$size(history);
		return A2(
			_elm_lang$core$Task$perform,
			function (_p19) {
				return _elm_lang$virtual_dom$VirtualDom_Debug$NoOp;
			},
			A2(_elm_lang$virtual_dom$Native_Debug.download, historyLength, json));
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$runIf = F2(
	function (bool, task) {
		return bool ? A2(
			_elm_lang$core$Task$perform,
			_elm_lang$core$Basics$always(_elm_lang$virtual_dom$VirtualDom_Debug$NoOp),
			task) : _elm_lang$core$Platform_Cmd$none;
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$updateUserMsg = F4(
	function (userUpdate, scrollTask, userMsg, _p20) {
		var _p21 = _p20;
		var _p25 = _p21.state;
		var _p24 = _p21;
		var userModel = _elm_lang$virtual_dom$VirtualDom_Debug$getLatestModel(_p25);
		var newHistory = A3(_elm_lang$virtual_dom$VirtualDom_History$add, userMsg, userModel, _p21.history);
		var _p22 = A2(userUpdate, userMsg, userModel);
		var newUserModel = _p22._0;
		var userCmds = _p22._1;
		var commands = A2(_elm_lang$core$Platform_Cmd$map, _elm_lang$virtual_dom$VirtualDom_Debug$UserMsg, userCmds);
		var _p23 = _p25;
		if (_p23.ctor === 'Running') {
			return A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_elm_lang$core$Native_Utils.update(
					_p24,
					{
						history: newHistory,
						state: _elm_lang$virtual_dom$VirtualDom_Debug$Running(newUserModel),
						expando: A2(_elm_lang$virtual_dom$VirtualDom_Expando$merge, newUserModel, _p21.expando)
					}),
				{
					ctor: '::',
					_0: commands,
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$virtual_dom$VirtualDom_Debug$runIf, _p24.isDebuggerOpen, scrollTask),
						_1: {ctor: '[]'}
					}
				});
		} else {
			return A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_elm_lang$core$Native_Utils.update(
					_p24,
					{
						history: newHistory,
						state: A3(_elm_lang$virtual_dom$VirtualDom_Debug$Paused, _p23._0, _p23._1, newUserModel)
					}),
				{
					ctor: '::',
					_0: commands,
					_1: {ctor: '[]'}
				});
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapUpdate = F4(
	function (userUpdate, scrollTask, msg, model) {
		wrapUpdate:
		while (true) {
			var _p26 = msg;
			switch (_p26.ctor) {
				case 'NoOp':
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						model,
						{ctor: '[]'});
				case 'UserMsg':
					return A4(_elm_lang$virtual_dom$VirtualDom_Debug$updateUserMsg, userUpdate, scrollTask, _p26._0, model);
				case 'ExpandoMsg':
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{
								expando: A2(_elm_lang$virtual_dom$VirtualDom_Expando$update, _p26._0, model.expando)
							}),
						{ctor: '[]'});
				case 'Resume':
					var _p27 = model.state;
					if (_p27.ctor === 'Running') {
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							model,
							{ctor: '[]'});
					} else {
						var _p28 = _p27._2;
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								model,
								{
									state: _elm_lang$virtual_dom$VirtualDom_Debug$Running(_p28),
									expando: A2(_elm_lang$virtual_dom$VirtualDom_Expando$merge, _p28, model.expando)
								}),
							{
								ctor: '::',
								_0: A2(_elm_lang$virtual_dom$VirtualDom_Debug$runIf, model.isDebuggerOpen, scrollTask),
								_1: {ctor: '[]'}
							});
					}
				case 'Jump':
					var _p30 = _p26._0;
					var _p29 = A3(_elm_lang$virtual_dom$VirtualDom_History$get, userUpdate, _p30, model.history);
					var indexModel = _p29._0;
					var indexMsg = _p29._1;
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{
								state: A3(
									_elm_lang$virtual_dom$VirtualDom_Debug$Paused,
									_p30,
									indexModel,
									_elm_lang$virtual_dom$VirtualDom_Debug$getLatestModel(model.state)),
								expando: A2(_elm_lang$virtual_dom$VirtualDom_Expando$merge, indexModel, model.expando)
							}),
						{ctor: '[]'});
				case 'Open':
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{isDebuggerOpen: true}),
						{ctor: '[]'});
				case 'Close':
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{isDebuggerOpen: false}),
						{ctor: '[]'});
				case 'Up':
					var index = function () {
						var _p31 = model.state;
						if (_p31.ctor === 'Paused') {
							return _p31._0;
						} else {
							return _elm_lang$virtual_dom$VirtualDom_History$size(model.history);
						}
					}();
					if (_elm_lang$core$Native_Utils.cmp(index, 0) > 0) {
						var _v17 = userUpdate,
							_v18 = scrollTask,
							_v19 = _elm_lang$virtual_dom$VirtualDom_Debug$Jump(index - 1),
							_v20 = model;
						userUpdate = _v17;
						scrollTask = _v18;
						msg = _v19;
						model = _v20;
						continue wrapUpdate;
					} else {
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							model,
							{ctor: '[]'});
					}
				case 'Down':
					var _p32 = model.state;
					if (_p32.ctor === 'Running') {
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							model,
							{ctor: '[]'});
					} else {
						var _p33 = _p32._0;
						if (_elm_lang$core$Native_Utils.eq(
							_p33,
							_elm_lang$virtual_dom$VirtualDom_History$size(model.history) - 1)) {
							var _v22 = userUpdate,
								_v23 = scrollTask,
								_v24 = _elm_lang$virtual_dom$VirtualDom_Debug$Resume,
								_v25 = model;
							userUpdate = _v22;
							scrollTask = _v23;
							msg = _v24;
							model = _v25;
							continue wrapUpdate;
						} else {
							var _v26 = userUpdate,
								_v27 = scrollTask,
								_v28 = _elm_lang$virtual_dom$VirtualDom_Debug$Jump(_p33 + 1),
								_v29 = model;
							userUpdate = _v26;
							scrollTask = _v27;
							msg = _v28;
							model = _v29;
							continue wrapUpdate;
						}
					}
				case 'Import':
					return A2(
						_elm_lang$virtual_dom$VirtualDom_Debug$withGoodMetadata,
						model,
						function (_p34) {
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								model,
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Debug$upload,
									_1: {ctor: '[]'}
								});
						});
				case 'Export':
					return A2(
						_elm_lang$virtual_dom$VirtualDom_Debug$withGoodMetadata,
						model,
						function (metadata) {
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								model,
								{
									ctor: '::',
									_0: A2(_elm_lang$virtual_dom$VirtualDom_Debug$download, metadata, model.history),
									_1: {ctor: '[]'}
								});
						});
				case 'Upload':
					return A2(
						_elm_lang$virtual_dom$VirtualDom_Debug$withGoodMetadata,
						model,
						function (metadata) {
							var _p35 = A2(_elm_lang$virtual_dom$VirtualDom_Overlay$assessImport, metadata, _p26._0);
							if (_p35.ctor === 'Err') {
								return A2(
									_elm_lang$core$Platform_Cmd_ops['!'],
									_elm_lang$core$Native_Utils.update(
										model,
										{overlay: _p35._0}),
									{ctor: '[]'});
							} else {
								return A3(_elm_lang$virtual_dom$VirtualDom_Debug$loadNewHistory, _p35._0, userUpdate, model);
							}
						});
				default:
					var _p36 = A2(_elm_lang$virtual_dom$VirtualDom_Overlay$close, _p26._0, model.overlay);
					if (_p36.ctor === 'Nothing') {
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								model,
								{overlay: _elm_lang$virtual_dom$VirtualDom_Overlay$none}),
							{ctor: '[]'});
					} else {
						return A3(_elm_lang$virtual_dom$VirtualDom_Debug$loadNewHistory, _p36._0, userUpdate, model);
					}
			}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$wrap = F2(
	function (metadata, _p37) {
		var _p38 = _p37;
		return {
			init: A2(_elm_lang$virtual_dom$VirtualDom_Debug$wrapInit, metadata, _p38.init),
			view: _elm_lang$virtual_dom$VirtualDom_Debug$wrapView(_p38.view),
			update: _elm_lang$virtual_dom$VirtualDom_Debug$wrapUpdate(_p38.update),
			viewIn: _elm_lang$virtual_dom$VirtualDom_Debug$viewIn,
			viewOut: _elm_lang$virtual_dom$VirtualDom_Debug$viewOut,
			subscriptions: _elm_lang$virtual_dom$VirtualDom_Debug$wrapSubs(_p38.subscriptions)
		};
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags = F2(
	function (metadata, _p39) {
		var _p40 = _p39;
		return {
			init: function (flags) {
				return A2(
					_elm_lang$virtual_dom$VirtualDom_Debug$wrapInit,
					metadata,
					_p40.init(flags));
			},
			view: _elm_lang$virtual_dom$VirtualDom_Debug$wrapView(_p40.view),
			update: _elm_lang$virtual_dom$VirtualDom_Debug$wrapUpdate(_p40.update),
			viewIn: _elm_lang$virtual_dom$VirtualDom_Debug$viewIn,
			viewOut: _elm_lang$virtual_dom$VirtualDom_Debug$viewOut,
			subscriptions: _elm_lang$virtual_dom$VirtualDom_Debug$wrapSubs(_p40.subscriptions)
		};
	});

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

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _evancz$elm_graphics$Native_Element = function()
{


// CREATION

var createNode =
	typeof document === 'undefined'
		?
			function(_)
			{
				return {
					style: {},
					appendChild: function() {}
				};
			}
		:
			function(elementType)
			{
				var node = document.createElement(elementType);
				node.style.padding = '0';
				node.style.margin = '0';
				return node;
			}
		;


function newElement(width, height, elementPrim)
{
	return {
		ctor: 'Element_elm_builtin',
		_0: {
			element: elementPrim,
			props: {
				width: width,
				height: height,
				opacity: 1,
				color: _elm_lang$core$Maybe$Nothing,
				href: '',
				tag: ''
			}
		}
	};
}


// PROPERTIES

function setProps(elem, node)
{
	var props = elem.props;

	var element = elem.element;
	var width = props.width - (element.adjustWidth || 0);
	var height = props.height - (element.adjustHeight || 0);
	node.style.width  = (width | 0) + 'px';
	node.style.height = (height | 0) + 'px';

	if (props.opacity !== 1)
	{
		node.style.opacity = props.opacity;
	}

	if (props.color.ctor === 'Just')
	{
		node.style.backgroundColor = _evancz$elm_graphics$Text$colorToCss(props.color._0);
	}

	if (props.tag !== '')
	{
		node.id = props.tag;
	}

	if (props.href !== '')
	{
		var anchor = createNode('a');
		anchor.href = props.href;
		anchor.style.display = 'block';
		anchor.style.pointerEvents = 'auto';
		anchor.appendChild(node);
		node = anchor;
	}

	return node;
}


// IMAGES

function image(props, img)
{
	switch (img._0.ctor)
	{
		case 'Plain':
			return plainImage(img._3);

		case 'Fitted':
			return fittedImage(props.width, props.height, img._3);

		case 'Cropped':
			return croppedImage(img, props.width, props.height, img._3);

		case 'Tiled':
			return tiledImage(img._3);
	}
}

function plainImage(src)
{
	var img = createNode('img');
	img.src = src;
	img.name = src;
	img.style.display = 'block';
	return img;
}

function tiledImage(src)
{
	var div = createNode('div');
	div.style.backgroundImage = 'url(' + src + ')';
	return div;
}

function fittedImage(w, h, src)
{
	var div = createNode('div');
	div.style.background = 'url(' + src + ') no-repeat center';
	div.style.webkitBackgroundSize = 'cover';
	div.style.MozBackgroundSize = 'cover';
	div.style.OBackgroundSize = 'cover';
	div.style.backgroundSize = 'cover';
	return div;
}

function croppedImage(elem, w, h, src)
{
	var pos = elem._0._0;
	var e = createNode('div');
	e.style.overflow = 'hidden';

	var img = createNode('img');
	img.onload = function() {
		var sw = w / elem._1, sh = h / elem._2;
		img.style.width = ((this.width * sw) | 0) + 'px';
		img.style.height = ((this.height * sh) | 0) + 'px';
		img.style.marginLeft = ((- pos._0 * sw) | 0) + 'px';
		img.style.marginTop = ((- pos._1 * sh) | 0) + 'px';
	};
	img.src = src;
	img.name = src;
	e.appendChild(img);
	return e;
}


// FLOW

function goOut(node)
{
	node.style.position = 'absolute';
	return node;
}
function goDown(node)
{
	return node;
}
function goRight(node)
{
	node.style.styleFloat = 'left';
	node.style.cssFloat = 'left';
	return node;
}

var directionTable = {
	DUp: goDown,
	DDown: goDown,
	DLeft: goRight,
	DRight: goRight,
	DIn: goOut,
	DOut: goOut
};
function needsReversal(dir)
{
	return dir === 'DUp' || dir === 'DLeft' || dir === 'DIn';
}

function flow(dir, elist)
{
	var array = _elm_lang$core$Native_List.toArray(elist);
	var container = createNode('div');
	var goDir = directionTable[dir];
	if (goDir === goOut)
	{
		container.style.pointerEvents = 'none';
	}
	if (needsReversal(dir))
	{
		array.reverse();
	}
	var len = array.length;
	for (var i = 0; i < len; ++i)
	{
		container.appendChild(goDir(render(array[i])));
	}
	return container;
}


// CONTAINER

function toPos(pos)
{
	return pos.ctor === 'Absolute'
		? pos._0 + 'px'
		: (pos._0 * 100) + '%';
}

// must clear right, left, top, bottom, and transform
// before calling this function
function setPos(pos, wrappedElement, e)
{
	var elem = wrappedElement._0;
	var element = elem.element;
	var props = elem.props;
	var w = props.width + (element.adjustWidth ? element.adjustWidth : 0);
	var h = props.height + (element.adjustHeight ? element.adjustHeight : 0);

	e.style.position = 'absolute';
	e.style.margin = 'auto';
	var transform = '';

	switch (pos.horizontal.ctor)
	{
		case 'P':
			e.style.right = toPos(pos.x);
			e.style.removeProperty('left');
			break;

		case 'Z':
			transform = 'translateX(' + ((-w / 2) | 0) + 'px) ';

		case 'N':
			e.style.left = toPos(pos.x);
			e.style.removeProperty('right');
			break;
	}
	switch (pos.vertical.ctor)
	{
		case 'N':
			e.style.bottom = toPos(pos.y);
			e.style.removeProperty('top');
			break;

		case 'Z':
			transform += 'translateY(' + ((-h / 2) | 0) + 'px)';

		case 'P':
			e.style.top = toPos(pos.y);
			e.style.removeProperty('bottom');
			break;
	}
	if (transform !== '')
	{
		addTransform(e.style, transform);
	}
	return e;
}

function addTransform(style, transform)
{
	style.transform       = transform;
	style.msTransform     = transform;
	style.MozTransform    = transform;
	style.webkitTransform = transform;
	style.OTransform      = transform;
}

function container(pos, elem)
{
	var e = render(elem);
	setPos(pos, elem, e);
	var div = createNode('div');
	div.style.position = 'relative';
	div.style.overflow = 'hidden';
	div.appendChild(e);
	return div;
}


function rawHtml(elem)
{
	var html = elem.html;
	var align = elem.align;

	var div = createNode('div');
	div.innerHTML = html;
	div.style.visibility = 'hidden';
	if (align)
	{
		div.style.textAlign = align;
	}
	div.style.visibility = 'visible';
	div.style.pointerEvents = 'auto';
	return div;
}


// TO HTML

function toHtml(element)
{
	return _elm_lang$virtual_dom$Native_VirtualDom.custom(
		_elm_lang$core$Native_List.Nil,
		element,
		implementation
	);
}


// WIDGET IMPLEMENTATION

var implementation = {
	render: render,
	diff: diff
};

function diff(a, b)
{
	var aModel = a.model;
	var bModel = b.model;

	if (aModel === bModel)
	{
		return null;
	}

	return {
		applyPatch: applyPatch,
		data: { a: aModel, b: bModel }
	};
}

function applyPatch(domNode, data)
{
	return updateAndReplace(domNode, data.a, data.b);
}


// RENDER

function render(wrappedElement)
{
	var elem = wrappedElement._0;
	return setProps(elem, makeElement(elem));
}

function makeElement(e)
{
	var elem = e.element;
	switch (elem.ctor)
	{
		case 'Image':
			return image(e.props, elem);

		case 'Flow':
			return flow(elem._0.ctor, elem._1);

		case 'Container':
			return container(elem._0, elem._1);

		case 'Spacer':
			return createNode('div');

		case 'RawHtml':
			return rawHtml(elem);

		case 'Custom':
			return elem.render(elem.model);
	}
}

function updateAndReplace(node, curr, next)
{
	var newNode = update(node, curr, next);
	if (newNode !== node)
	{
		node.parentNode.replaceChild(newNode, node);
	}
	return newNode;
}


// UPDATE

function update(node, wrappedCurrent, wrappedNext)
{
	var curr = wrappedCurrent._0;
	var next = wrappedNext._0;
	var rootNode = node;

	if (curr === next)
	{
		return rootNode;
	}

	if (node.tagName === 'A')
	{
		node = node.firstChild;
	}
	if (curr.element.ctor !== next.element.ctor)
	{
		return render(wrappedNext);
	}
	var nextE = next.element;
	var currE = curr.element;
	switch (nextE.ctor)
	{
		case 'Spacer':
			updateProps(node, curr, next);
			return rootNode;

		case 'RawHtml':
			if(currE.html.valueOf() !== nextE.html.valueOf())
			{
				node.innerHTML = nextE.html;
			}
			updateProps(node, curr, next);
			return rootNode;

		case 'Image':
			if (nextE._0.ctor === 'Plain')
			{
				if (nextE._3 !== currE._3)
				{
					node.src = nextE._3;
				}
			}
			else if (!_elm_lang$core$Native_Utils.eq(nextE, currE)
				|| next.props.width !== curr.props.width
				|| next.props.height !== curr.props.height)
			{
				return render(wrappedNext);
			}
			updateProps(node, curr, next);
			return rootNode;

		case 'Flow':
			var arr = _elm_lang$core$Native_List.toArray(nextE._1);
			for (var i = arr.length; i--; )
			{
				arr[i] = arr[i]._0.element.ctor;
			}
			if (nextE._0.ctor !== currE._0.ctor)
			{
				return render(wrappedNext);
			}
			var nexts = _elm_lang$core$Native_List.toArray(nextE._1);
			var kids = node.childNodes;
			if (nexts.length !== kids.length)
			{
				return render(wrappedNext);
			}
			var currs = _elm_lang$core$Native_List.toArray(currE._1);
			var dir = nextE._0.ctor;
			var goDir = directionTable[dir];
			var toReverse = needsReversal(dir);
			var len = kids.length;
			for (var i = len; i--; )
			{
				var subNode = kids[toReverse ? len - i - 1 : i];
				goDir(updateAndReplace(subNode, currs[i], nexts[i]));
			}
			updateProps(node, curr, next);
			return rootNode;

		case 'Container':
			var subNode = node.firstChild;
			var newSubNode = updateAndReplace(subNode, currE._1, nextE._1);
			setPos(nextE._0, nextE._1, newSubNode);
			updateProps(node, curr, next);
			return rootNode;

		case 'Custom':
			if (currE.type === nextE.type)
			{
				var updatedNode = nextE.update(node, currE.model, nextE.model);
				updateProps(updatedNode, curr, next);
				return updatedNode;
			}
			return render(wrappedNext);
	}
}

function updateProps(node, curr, next)
{
	var nextProps = next.props;
	var currProps = curr.props;

	var element = next.element;
	var width = nextProps.width - (element.adjustWidth || 0);
	var height = nextProps.height - (element.adjustHeight || 0);
	if (width !== currProps.width)
	{
		node.style.width = (width | 0) + 'px';
	}
	if (height !== currProps.height)
	{
		node.style.height = (height | 0) + 'px';
	}

	if (nextProps.opacity !== currProps.opacity)
	{
		node.style.opacity = nextProps.opacity;
	}

	var nextColor = nextProps.color.ctor === 'Just'
		? _evancz$elm_graphics$Text$colorToCss(nextProps.color._0)
		: '';
	if (node.style.backgroundColor !== nextColor)
	{
		node.style.backgroundColor = nextColor;
	}

	if (nextProps.tag !== currProps.tag)
	{
		node.id = nextProps.tag;
	}

	if (nextProps.href !== currProps.href)
	{
		if (currProps.href === '')
		{
			// add a surrounding href
			var anchor = createNode('a');
			anchor.href = nextProps.href;
			anchor.style.display = 'block';
			anchor.style.pointerEvents = 'auto';

			node.parentNode.replaceChild(anchor, node);
			anchor.appendChild(node);
		}
		else if (nextProps.href === '')
		{
			// remove the surrounding href
			var anchor = node.parentNode;
			anchor.parentNode.replaceChild(node, anchor);
		}
		else
		{
			// just update the link
			node.parentNode.href = nextProps.href;
		}
	}
}


// TEXT

function block(align)
{
	return function(text)
	{
		var raw = {
			ctor: 'RawHtml',
			html: _evancz$elm_graphics$Text$toHtmlString(text),
			align: align
		};
		var pos = htmlHeight(0, raw);
		return newElement(pos._0, pos._1, raw);
	};
}

var htmlHeight =
	typeof document !== 'undefined'
		? realHtmlHeight
		: function(a, b) { return _elm_lang$core$Native_Utils.Tuple2(0, 0); };

function realHtmlHeight(width, rawHtml)
{
	// create dummy node
	var temp = document.createElement('div');
	temp.innerHTML = rawHtml.html;
	if (width > 0)
	{
		temp.style.width = width + 'px';
	}
	temp.style.visibility = 'hidden';
	temp.style.styleFloat = 'left';
	temp.style.cssFloat = 'left';

	document.body.appendChild(temp);

	// get dimensions
	var style = window.getComputedStyle(temp, null);
	var w = Math.ceil(style.getPropertyValue('width').slice(0, -2) - 0);
	var h = Math.ceil(style.getPropertyValue('height').slice(0, -2) - 0);
	document.body.removeChild(temp);
	return _elm_lang$core$Native_Utils.Tuple2(w, h);
}


return {
	toHtml: toHtml,

	render: render,
	update: update,
	createNode: createNode,
	newElement: F3(newElement),
	addTransform: addTransform,

	block: block
};

}();


var _evancz$elm_graphics$Text$wrap = F3(
	function (maybeHref, styles, insides) {
		var linkedInsides = function () {
			var _p0 = maybeHref;
			if (_p0.ctor === 'Nothing') {
				return insides;
			} else {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					'<a href=\"',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_p0._0,
						A2(
							_elm_lang$core$Basics_ops['++'],
							'\">',
							A2(_elm_lang$core$Basics_ops['++'], insides, '</a>'))));
			}
		}();
		return _elm_lang$core$Native_Utils.eq(styles, '') ? linkedInsides : A2(
			_elm_lang$core$Basics_ops['++'],
			'<span style=\"',
			A2(
				_elm_lang$core$Basics_ops['++'],
				styles,
				A2(
					_elm_lang$core$Basics_ops['++'],
					'\">',
					A2(_elm_lang$core$Basics_ops['++'], linkedInsides, '</span>'))));
	});
var _evancz$elm_graphics$Text$replace = F3(
	function (from, to, str) {
		return A4(
			_elm_lang$core$Regex$replace,
			_elm_lang$core$Regex$All,
			_elm_lang$core$Regex$regex(from),
			function (_p1) {
				return to;
			},
			str);
	});
var _evancz$elm_graphics$Text$toHtmlString = function (text) {
	return A3(_evancz$elm_graphics$Text$toHtmlStringHelp, _elm_lang$core$Maybe$Nothing, '', text);
};
var _evancz$elm_graphics$Text$toHtmlStringHelp = F3(
	function (maybeHref, styles, text) {
		toHtmlStringHelp:
		while (true) {
			var _p2 = text;
			switch (_p2.ctor) {
				case 'Str':
					return A3(
						_evancz$elm_graphics$Text$wrap,
						maybeHref,
						styles,
						A2(
							_elm_lang$core$String$join,
							'<br>',
							A2(
								_elm_lang$core$List$map,
								A2(_evancz$elm_graphics$Text$replace, ' ', '&nbsp;'),
								_elm_lang$core$String$lines(
									A3(
										_evancz$elm_graphics$Text$replace,
										'>',
										'&#62;',
										A3(
											_evancz$elm_graphics$Text$replace,
											'<',
											'&#60;',
											A3(
												_evancz$elm_graphics$Text$replace,
												'\'',
												'&#39;',
												A3(_evancz$elm_graphics$Text$replace, '\"', '&#34;', _p2._0))))))));
				case 'Append':
					return A3(
						_evancz$elm_graphics$Text$wrap,
						maybeHref,
						styles,
						A2(
							_elm_lang$core$Basics_ops['++'],
							_evancz$elm_graphics$Text$toHtmlString(_p2._0),
							_evancz$elm_graphics$Text$toHtmlString(_p2._1)));
				case 'Link':
					var _v2 = _elm_lang$core$Maybe$Just(
						A2(_elm_lang$core$Maybe$withDefault, _p2._0, maybeHref)),
						_v3 = styles,
						_v4 = _p2._1;
					maybeHref = _v2;
					styles = _v3;
					text = _v4;
					continue toHtmlStringHelp;
				default:
					var _v5 = maybeHref,
						_v6 = A2(
						_elm_lang$core$Basics_ops['++'],
						styles,
						A2(
							_elm_lang$core$Basics_ops['++'],
							_p2._0,
							A2(
								_elm_lang$core$Basics_ops['++'],
								':',
								A2(_elm_lang$core$Basics_ops['++'], _p2._1, ';')))),
						_v7 = _p2._2;
					maybeHref = _v5;
					styles = _v6;
					text = _v7;
					continue toHtmlStringHelp;
			}
		}
	});
var _evancz$elm_graphics$Text$colorToCss = function (color) {
	var _p3 = _elm_lang$core$Color$toRgb(color);
	var red = _p3.red;
	var green = _p3.green;
	var blue = _p3.blue;
	var alpha = _p3.alpha;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		'rgba(',
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(red),
			A2(
				_elm_lang$core$Basics_ops['++'],
				', ',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(green),
					A2(
						_elm_lang$core$Basics_ops['++'],
						', ',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(blue),
							A2(
								_elm_lang$core$Basics_ops['++'],
								', ',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(alpha),
									')'))))))));
};
var _evancz$elm_graphics$Text$typefacesToString = function (faces) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		'\'',
		A2(
			_elm_lang$core$Basics_ops['++'],
			A2(_elm_lang$core$String$join, '\', \'', faces),
			'\''));
};
var _evancz$elm_graphics$Text$maybeAdd = F3(
	function (add, maybeValue, text) {
		var _p4 = maybeValue;
		if (_p4.ctor === 'Nothing') {
			return text;
		} else {
			return A2(add, _p4._0, text);
		}
	});
var _evancz$elm_graphics$Text$defaultStyle = {
	typeface: {ctor: '[]'},
	height: _elm_lang$core$Maybe$Nothing,
	color: _elm_lang$core$Color$black,
	bold: false,
	italic: false,
	line: _elm_lang$core$Maybe$Nothing
};
var _evancz$elm_graphics$Text$Style = F6(
	function (a, b, c, d, e, f) {
		return {typeface: a, height: b, color: c, bold: d, italic: e, line: f};
	});
var _evancz$elm_graphics$Text$Meta = F3(
	function (a, b, c) {
		return {ctor: 'Meta', _0: a, _1: b, _2: c};
	});
var _evancz$elm_graphics$Text$typeface = F2(
	function (faces, text) {
		var _p5 = faces;
		if (_p5.ctor === '[]') {
			return text;
		} else {
			return A3(
				_evancz$elm_graphics$Text$Meta,
				'font-family',
				_evancz$elm_graphics$Text$typefacesToString(faces),
				text);
		}
	});
var _evancz$elm_graphics$Text$monospace = function (text) {
	return A3(_evancz$elm_graphics$Text$Meta, 'font-family', 'monospace', text);
};
var _evancz$elm_graphics$Text$height = F2(
	function (px, text) {
		return A3(
			_evancz$elm_graphics$Text$Meta,
			'font-size',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(px),
				'px'),
			text);
	});
var _evancz$elm_graphics$Text$color = F2(
	function (color, text) {
		return A3(
			_evancz$elm_graphics$Text$Meta,
			'color',
			_evancz$elm_graphics$Text$colorToCss(color),
			text);
	});
var _evancz$elm_graphics$Text$bold = function (text) {
	return A3(_evancz$elm_graphics$Text$Meta, 'font-weight', 'bold', text);
};
var _evancz$elm_graphics$Text$italic = function (text) {
	return A3(_evancz$elm_graphics$Text$Meta, 'font-style', 'italic', text);
};
var _evancz$elm_graphics$Text$line = F2(
	function (lineTag, text) {
		var decoration = function () {
			var _p6 = lineTag;
			switch (_p6.ctor) {
				case 'Under':
					return 'underline';
				case 'Over':
					return 'overline';
				default:
					return 'line-through';
			}
		}();
		return A3(_evancz$elm_graphics$Text$Meta, 'text-decoration', decoration, text);
	});
var _evancz$elm_graphics$Text$style = F2(
	function (sty, text) {
		return A3(
			_evancz$elm_graphics$Text$maybeAdd,
			_evancz$elm_graphics$Text$height,
			sty.height,
			A3(
				_evancz$elm_graphics$Text$maybeAdd,
				_evancz$elm_graphics$Text$line,
				sty.line,
				(sty.italic ? _evancz$elm_graphics$Text$italic : _elm_lang$core$Basics$identity)(
					(sty.bold ? _evancz$elm_graphics$Text$bold : _elm_lang$core$Basics$identity)(
						A2(
							_evancz$elm_graphics$Text$typeface,
							sty.typeface,
							A2(_evancz$elm_graphics$Text$color, sty.color, text))))));
	});
var _evancz$elm_graphics$Text$Link = F2(
	function (a, b) {
		return {ctor: 'Link', _0: a, _1: b};
	});
var _evancz$elm_graphics$Text$link = _evancz$elm_graphics$Text$Link;
var _evancz$elm_graphics$Text$Append = F2(
	function (a, b) {
		return {ctor: 'Append', _0: a, _1: b};
	});
var _evancz$elm_graphics$Text$append = _evancz$elm_graphics$Text$Append;
var _evancz$elm_graphics$Text$Str = function (a) {
	return {ctor: 'Str', _0: a};
};
var _evancz$elm_graphics$Text$fromString = _evancz$elm_graphics$Text$Str;
var _evancz$elm_graphics$Text$empty = _evancz$elm_graphics$Text$fromString('');
var _evancz$elm_graphics$Text$concat = function (texts) {
	return A3(_elm_lang$core$List$foldr, _evancz$elm_graphics$Text$append, _evancz$elm_graphics$Text$empty, texts);
};
var _evancz$elm_graphics$Text$join = F2(
	function (seperator, texts) {
		return _evancz$elm_graphics$Text$concat(
			A2(_elm_lang$core$List$intersperse, seperator, texts));
	});
var _evancz$elm_graphics$Text$Through = {ctor: 'Through'};
var _evancz$elm_graphics$Text$Over = {ctor: 'Over'};
var _evancz$elm_graphics$Text$Under = {ctor: 'Under'};

var _evancz$elm_graphics$Element$justified = _evancz$elm_graphics$Native_Element.block('justify');
var _evancz$elm_graphics$Element$centered = _evancz$elm_graphics$Native_Element.block('center');
var _evancz$elm_graphics$Element$rightAligned = _evancz$elm_graphics$Native_Element.block('right');
var _evancz$elm_graphics$Element$leftAligned = _evancz$elm_graphics$Native_Element.block('left');
var _evancz$elm_graphics$Element$show = function (value) {
	return _evancz$elm_graphics$Element$leftAligned(
		_evancz$elm_graphics$Text$monospace(
			_evancz$elm_graphics$Text$fromString(
				_elm_lang$core$Basics$toString(value))));
};
var _evancz$elm_graphics$Element$newElement = _evancz$elm_graphics$Native_Element.newElement;
var _evancz$elm_graphics$Element$sizeOf = function (_p0) {
	var _p1 = _p0;
	var _p2 = _p1._0;
	return {ctor: '_Tuple2', _0: _p2.props.width, _1: _p2.props.height};
};
var _evancz$elm_graphics$Element$heightOf = function (_p3) {
	var _p4 = _p3;
	return _p4._0.props.height;
};
var _evancz$elm_graphics$Element$widthOf = function (_p5) {
	var _p6 = _p5;
	return _p6._0.props.width;
};
var _evancz$elm_graphics$Element$toHtml = _evancz$elm_graphics$Native_Element.toHtml;
var _evancz$elm_graphics$Element$Properties = F6(
	function (a, b, c, d, e, f) {
		return {width: a, height: b, opacity: c, color: d, href: e, tag: f};
	});
var _evancz$elm_graphics$Element$RawPosition = F4(
	function (a, b, c, d) {
		return {horizontal: a, vertical: b, x: c, y: d};
	});
var _evancz$elm_graphics$Element$Element_elm_builtin = function (a) {
	return {ctor: 'Element_elm_builtin', _0: a};
};
var _evancz$elm_graphics$Element$width = F2(
	function (newWidth, _p7) {
		var _p8 = _p7;
		var _p11 = _p8._0.props;
		var _p10 = _p8._0.element;
		var newHeight = function () {
			var _p9 = _p10;
			switch (_p9.ctor) {
				case 'Image':
					return _elm_lang$core$Basics$round(
						(_elm_lang$core$Basics$toFloat(_p9._2) / _elm_lang$core$Basics$toFloat(_p9._1)) * _elm_lang$core$Basics$toFloat(newWidth));
				case 'RawHtml':
					return _elm_lang$core$Tuple$second(
						A2(_evancz$elm_graphics$Native_Element.htmlHeight, newWidth, _p10));
				default:
					return _p11.height;
			}
		}();
		return _evancz$elm_graphics$Element$Element_elm_builtin(
			{
				element: _p10,
				props: _elm_lang$core$Native_Utils.update(
					_p11,
					{width: newWidth, height: newHeight})
			});
	});
var _evancz$elm_graphics$Element$height = F2(
	function (newHeight, _p12) {
		var _p13 = _p12;
		return _evancz$elm_graphics$Element$Element_elm_builtin(
			{
				element: _p13._0.element,
				props: _elm_lang$core$Native_Utils.update(
					_p13._0.props,
					{height: newHeight})
			});
	});
var _evancz$elm_graphics$Element$size = F3(
	function (w, h, e) {
		return A2(
			_evancz$elm_graphics$Element$height,
			h,
			A2(_evancz$elm_graphics$Element$width, w, e));
	});
var _evancz$elm_graphics$Element$opacity = F2(
	function (givenOpacity, _p14) {
		var _p15 = _p14;
		return _evancz$elm_graphics$Element$Element_elm_builtin(
			{
				element: _p15._0.element,
				props: _elm_lang$core$Native_Utils.update(
					_p15._0.props,
					{opacity: givenOpacity})
			});
	});
var _evancz$elm_graphics$Element$color = F2(
	function (clr, _p16) {
		var _p17 = _p16;
		return _evancz$elm_graphics$Element$Element_elm_builtin(
			{
				element: _p17._0.element,
				props: _elm_lang$core$Native_Utils.update(
					_p17._0.props,
					{
						color: _elm_lang$core$Maybe$Just(clr)
					})
			});
	});
var _evancz$elm_graphics$Element$tag = F2(
	function (name, _p18) {
		var _p19 = _p18;
		return _evancz$elm_graphics$Element$Element_elm_builtin(
			{
				element: _p19._0.element,
				props: _elm_lang$core$Native_Utils.update(
					_p19._0.props,
					{tag: name})
			});
	});
var _evancz$elm_graphics$Element$link = F2(
	function (href, _p20) {
		var _p21 = _p20;
		return _evancz$elm_graphics$Element$Element_elm_builtin(
			{
				element: _p21._0.element,
				props: _elm_lang$core$Native_Utils.update(
					_p21._0.props,
					{href: href})
			});
	});
var _evancz$elm_graphics$Element$Custom = {ctor: 'Custom'};
var _evancz$elm_graphics$Element$RawHtml = {ctor: 'RawHtml'};
var _evancz$elm_graphics$Element$Spacer = {ctor: 'Spacer'};
var _evancz$elm_graphics$Element$spacer = F2(
	function (w, h) {
		return A3(_evancz$elm_graphics$Element$newElement, w, h, _evancz$elm_graphics$Element$Spacer);
	});
var _evancz$elm_graphics$Element$empty = A2(_evancz$elm_graphics$Element$spacer, 0, 0);
var _evancz$elm_graphics$Element$Flow = F2(
	function (a, b) {
		return {ctor: 'Flow', _0: a, _1: b};
	});
var _evancz$elm_graphics$Element$flow = F2(
	function (dir, es) {
		var newFlow = F2(
			function (w, h) {
				return A3(
					_evancz$elm_graphics$Element$newElement,
					w,
					h,
					A2(_evancz$elm_graphics$Element$Flow, dir, es));
			});
		var maxOrZero = function (list) {
			return A2(
				_elm_lang$core$Maybe$withDefault,
				0,
				_elm_lang$core$List$maximum(list));
		};
		var hs = A2(_elm_lang$core$List$map, _evancz$elm_graphics$Element$heightOf, es);
		var ws = A2(_elm_lang$core$List$map, _evancz$elm_graphics$Element$widthOf, es);
		if (_elm_lang$core$Native_Utils.eq(
			es,
			{ctor: '[]'})) {
			return _evancz$elm_graphics$Element$empty;
		} else {
			var _p22 = dir;
			switch (_p22.ctor) {
				case 'DUp':
					return A2(
						newFlow,
						maxOrZero(ws),
						_elm_lang$core$List$sum(hs));
				case 'DDown':
					return A2(
						newFlow,
						maxOrZero(ws),
						_elm_lang$core$List$sum(hs));
				case 'DLeft':
					return A2(
						newFlow,
						_elm_lang$core$List$sum(ws),
						maxOrZero(hs));
				case 'DRight':
					return A2(
						newFlow,
						_elm_lang$core$List$sum(ws),
						maxOrZero(hs));
				case 'DIn':
					return A2(
						newFlow,
						maxOrZero(ws),
						maxOrZero(hs));
				default:
					return A2(
						newFlow,
						maxOrZero(ws),
						maxOrZero(hs));
			}
		}
	});
var _evancz$elm_graphics$Element$Container = F2(
	function (a, b) {
		return {ctor: 'Container', _0: a, _1: b};
	});
var _evancz$elm_graphics$Element$container = F4(
	function (w, h, _p23, e) {
		var _p24 = _p23;
		return A3(
			_evancz$elm_graphics$Element$newElement,
			w,
			h,
			A2(_evancz$elm_graphics$Element$Container, _p24._0, e));
	});
var _evancz$elm_graphics$Element$Image = F4(
	function (a, b, c, d) {
		return {ctor: 'Image', _0: a, _1: b, _2: c, _3: d};
	});
var _evancz$elm_graphics$Element$Tiled = {ctor: 'Tiled'};
var _evancz$elm_graphics$Element$tiledImage = F3(
	function (w, h, src) {
		return A3(
			_evancz$elm_graphics$Element$newElement,
			w,
			h,
			A4(_evancz$elm_graphics$Element$Image, _evancz$elm_graphics$Element$Tiled, w, h, src));
	});
var _evancz$elm_graphics$Element$Cropped = function (a) {
	return {ctor: 'Cropped', _0: a};
};
var _evancz$elm_graphics$Element$croppedImage = F4(
	function (pos, w, h, src) {
		return A3(
			_evancz$elm_graphics$Element$newElement,
			w,
			h,
			A4(
				_evancz$elm_graphics$Element$Image,
				_evancz$elm_graphics$Element$Cropped(pos),
				w,
				h,
				src));
	});
var _evancz$elm_graphics$Element$Fitted = {ctor: 'Fitted'};
var _evancz$elm_graphics$Element$fittedImage = F3(
	function (w, h, src) {
		return A3(
			_evancz$elm_graphics$Element$newElement,
			w,
			h,
			A4(_evancz$elm_graphics$Element$Image, _evancz$elm_graphics$Element$Fitted, w, h, src));
	});
var _evancz$elm_graphics$Element$Plain = {ctor: 'Plain'};
var _evancz$elm_graphics$Element$image = F3(
	function (w, h, src) {
		return A3(
			_evancz$elm_graphics$Element$newElement,
			w,
			h,
			A4(_evancz$elm_graphics$Element$Image, _evancz$elm_graphics$Element$Plain, w, h, src));
	});
var _evancz$elm_graphics$Element$N = {ctor: 'N'};
var _evancz$elm_graphics$Element$Z = {ctor: 'Z'};
var _evancz$elm_graphics$Element$P = {ctor: 'P'};
var _evancz$elm_graphics$Element$Relative = function (a) {
	return {ctor: 'Relative', _0: a};
};
var _evancz$elm_graphics$Element$relative = _evancz$elm_graphics$Element$Relative;
var _evancz$elm_graphics$Element$Absolute = function (a) {
	return {ctor: 'Absolute', _0: a};
};
var _evancz$elm_graphics$Element$absolute = _evancz$elm_graphics$Element$Absolute;
var _evancz$elm_graphics$Element$Position = function (a) {
	return {ctor: 'Position', _0: a};
};
var _evancz$elm_graphics$Element$middle = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$Z,
		vertical: _evancz$elm_graphics$Element$Z,
		x: _evancz$elm_graphics$Element$Relative(0.5),
		y: _evancz$elm_graphics$Element$Relative(0.5)
	});
var _evancz$elm_graphics$Element$topLeft = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$N,
		vertical: _evancz$elm_graphics$Element$P,
		x: _evancz$elm_graphics$Element$Absolute(0),
		y: _evancz$elm_graphics$Element$Absolute(0)
	});
var _evancz$elm_graphics$Element$topRight = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$P,
		vertical: _evancz$elm_graphics$Element$P,
		x: _evancz$elm_graphics$Element$Absolute(0),
		y: _evancz$elm_graphics$Element$Absolute(0)
	});
var _evancz$elm_graphics$Element$bottomLeft = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$N,
		vertical: _evancz$elm_graphics$Element$N,
		x: _evancz$elm_graphics$Element$Absolute(0),
		y: _evancz$elm_graphics$Element$Absolute(0)
	});
var _evancz$elm_graphics$Element$bottomRight = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$P,
		vertical: _evancz$elm_graphics$Element$N,
		x: _evancz$elm_graphics$Element$Absolute(0),
		y: _evancz$elm_graphics$Element$Absolute(0)
	});
var _evancz$elm_graphics$Element$midLeft = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$N,
		vertical: _evancz$elm_graphics$Element$Z,
		x: _evancz$elm_graphics$Element$Absolute(0),
		y: _evancz$elm_graphics$Element$Relative(0.5)
	});
var _evancz$elm_graphics$Element$midRight = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$P,
		vertical: _evancz$elm_graphics$Element$Z,
		x: _evancz$elm_graphics$Element$Absolute(0),
		y: _evancz$elm_graphics$Element$Relative(0.5)
	});
var _evancz$elm_graphics$Element$midTop = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$Z,
		vertical: _evancz$elm_graphics$Element$P,
		x: _evancz$elm_graphics$Element$Relative(0.5),
		y: _evancz$elm_graphics$Element$Absolute(0)
	});
var _evancz$elm_graphics$Element$midBottom = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$Z,
		vertical: _evancz$elm_graphics$Element$N,
		x: _evancz$elm_graphics$Element$Relative(0.5),
		y: _evancz$elm_graphics$Element$Absolute(0)
	});
var _evancz$elm_graphics$Element$middleAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$Z, vertical: _evancz$elm_graphics$Element$Z, x: x, y: y});
	});
var _evancz$elm_graphics$Element$topLeftAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$N, vertical: _evancz$elm_graphics$Element$P, x: x, y: y});
	});
var _evancz$elm_graphics$Element$topRightAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$P, vertical: _evancz$elm_graphics$Element$P, x: x, y: y});
	});
var _evancz$elm_graphics$Element$bottomLeftAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$N, vertical: _evancz$elm_graphics$Element$N, x: x, y: y});
	});
var _evancz$elm_graphics$Element$bottomRightAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$P, vertical: _evancz$elm_graphics$Element$N, x: x, y: y});
	});
var _evancz$elm_graphics$Element$midLeftAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$N, vertical: _evancz$elm_graphics$Element$Z, x: x, y: y});
	});
var _evancz$elm_graphics$Element$midRightAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$P, vertical: _evancz$elm_graphics$Element$Z, x: x, y: y});
	});
var _evancz$elm_graphics$Element$midTopAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$Z, vertical: _evancz$elm_graphics$Element$P, x: x, y: y});
	});
var _evancz$elm_graphics$Element$midBottomAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$Z, vertical: _evancz$elm_graphics$Element$N, x: x, y: y});
	});
var _evancz$elm_graphics$Element$DOut = {ctor: 'DOut'};
var _evancz$elm_graphics$Element$layers = function (es) {
	var hs = A2(_elm_lang$core$List$map, _evancz$elm_graphics$Element$heightOf, es);
	var ws = A2(_elm_lang$core$List$map, _evancz$elm_graphics$Element$widthOf, es);
	return A3(
		_evancz$elm_graphics$Element$newElement,
		A2(
			_elm_lang$core$Maybe$withDefault,
			0,
			_elm_lang$core$List$maximum(ws)),
		A2(
			_elm_lang$core$Maybe$withDefault,
			0,
			_elm_lang$core$List$maximum(hs)),
		A2(_evancz$elm_graphics$Element$Flow, _evancz$elm_graphics$Element$DOut, es));
};
var _evancz$elm_graphics$Element$outward = _evancz$elm_graphics$Element$DOut;
var _evancz$elm_graphics$Element$DIn = {ctor: 'DIn'};
var _evancz$elm_graphics$Element$inward = _evancz$elm_graphics$Element$DIn;
var _evancz$elm_graphics$Element$DRight = {ctor: 'DRight'};
var _evancz$elm_graphics$Element$right = _evancz$elm_graphics$Element$DRight;
var _evancz$elm_graphics$Element$beside = F2(
	function (lft, rht) {
		return A3(
			_evancz$elm_graphics$Element$newElement,
			_evancz$elm_graphics$Element$widthOf(lft) + _evancz$elm_graphics$Element$widthOf(rht),
			A2(
				_elm_lang$core$Basics$max,
				_evancz$elm_graphics$Element$heightOf(lft),
				_evancz$elm_graphics$Element$heightOf(rht)),
			A2(
				_evancz$elm_graphics$Element$Flow,
				_evancz$elm_graphics$Element$right,
				{
					ctor: '::',
					_0: lft,
					_1: {
						ctor: '::',
						_0: rht,
						_1: {ctor: '[]'}
					}
				}));
	});
var _evancz$elm_graphics$Element$DLeft = {ctor: 'DLeft'};
var _evancz$elm_graphics$Element$left = _evancz$elm_graphics$Element$DLeft;
var _evancz$elm_graphics$Element$DDown = {ctor: 'DDown'};
var _evancz$elm_graphics$Element$above = F2(
	function (hi, lo) {
		return A3(
			_evancz$elm_graphics$Element$newElement,
			A2(
				_elm_lang$core$Basics$max,
				_evancz$elm_graphics$Element$widthOf(hi),
				_evancz$elm_graphics$Element$widthOf(lo)),
			_evancz$elm_graphics$Element$heightOf(hi) + _evancz$elm_graphics$Element$heightOf(lo),
			A2(
				_evancz$elm_graphics$Element$Flow,
				_evancz$elm_graphics$Element$DDown,
				{
					ctor: '::',
					_0: hi,
					_1: {
						ctor: '::',
						_0: lo,
						_1: {ctor: '[]'}
					}
				}));
	});
var _evancz$elm_graphics$Element$below = F2(
	function (lo, hi) {
		return A3(
			_evancz$elm_graphics$Element$newElement,
			A2(
				_elm_lang$core$Basics$max,
				_evancz$elm_graphics$Element$widthOf(hi),
				_evancz$elm_graphics$Element$widthOf(lo)),
			_evancz$elm_graphics$Element$heightOf(hi) + _evancz$elm_graphics$Element$heightOf(lo),
			A2(
				_evancz$elm_graphics$Element$Flow,
				_evancz$elm_graphics$Element$DDown,
				{
					ctor: '::',
					_0: hi,
					_1: {
						ctor: '::',
						_0: lo,
						_1: {ctor: '[]'}
					}
				}));
	});
var _evancz$elm_graphics$Element$down = _evancz$elm_graphics$Element$DDown;
var _evancz$elm_graphics$Element$DUp = {ctor: 'DUp'};
var _evancz$elm_graphics$Element$up = _evancz$elm_graphics$Element$DUp;

var _evancz$elm_graphics$Native_Collage = function()
{

function setStrokeStyle(ctx, style)
{
	ctx.lineWidth = style.width;

	var cap = style.cap.ctor;
	ctx.lineCap = cap === 'Flat'
		? 'butt'
		: cap === 'Round'
			? 'round'
			: 'square';

	var join = style.join.ctor;
	ctx.lineJoin = join === 'Smooth'
		? 'round'
		: join === 'Sharp'
			? 'miter'
			: 'bevel';

	ctx.miterLimit = style.join._0 || 10;
	ctx.strokeStyle = _evancz$elm_graphics$Text$colorToCss(style.color);
}

function setFillStyle(redo, ctx, style)
{
	var sty = style.ctor;
	ctx.fillStyle = sty === 'Solid'
		? _evancz$elm_graphics$Text$colorToCss(style._0)
		: sty === 'Texture'
			? texture(redo, ctx, style._0)
			: gradient(ctx, style._0);
}

function trace(ctx, path)
{
	var points = _elm_lang$core$Native_List.toArray(path);
	var i = points.length - 1;
	if (i <= 0)
	{
		return;
	}
	ctx.moveTo(points[i]._0, points[i]._1);
	while (i--)
	{
		ctx.lineTo(points[i]._0, points[i]._1);
	}
	if (path.closed)
	{
		i = points.length - 1;
		ctx.lineTo(points[i]._0, points[i]._1);
	}
}

function line(ctx, style, path)
{
	if (style.dashing.ctor === '[]')
	{
		trace(ctx, path);
	}
	else
	{
		customLineHelp(ctx, style, path);
	}
	ctx.scale(1, -1);
	ctx.stroke();
}

function customLineHelp(ctx, style, path)
{
	var points = _elm_lang$core$Native_List.toArray(path);
	if (path.closed)
	{
		points.push(points[0]);
	}
	var pattern = _elm_lang$core$Native_List.toArray(style.dashing);
	var i = points.length - 1;
	if (i <= 0)
	{
		return;
	}
	var x0 = points[i]._0, y0 = points[i]._1;
	var x1 = 0, y1 = 0, dx = 0, dy = 0, remaining = 0;
	var pindex = 0, plen = pattern.length;
	var draw = true, segmentLength = pattern[0];
	ctx.moveTo(x0, y0);
	while (i--)
	{
		x1 = points[i]._0;
		y1 = points[i]._1;
		dx = x1 - x0;
		dy = y1 - y0;
		remaining = Math.sqrt(dx * dx + dy * dy);
		while (segmentLength <= remaining)
		{
			x0 += dx * segmentLength / remaining;
			y0 += dy * segmentLength / remaining;
			ctx[draw ? 'lineTo' : 'moveTo'](x0, y0);
			// update starting position
			dx = x1 - x0;
			dy = y1 - y0;
			remaining = Math.sqrt(dx * dx + dy * dy);
			// update pattern
			draw = !draw;
			pindex = (pindex + 1) % plen;
			segmentLength = pattern[pindex];
		}
		if (remaining > 0)
		{
			ctx[draw ? 'lineTo' : 'moveTo'](x1, y1);
			segmentLength -= remaining;
		}
		x0 = x1;
		y0 = y1;
	}
}

function drawLine(ctx, style, path)
{
	setStrokeStyle(ctx, style);
	return line(ctx, style, path);
}

function texture(redo, ctx, src)
{
	var img = new Image();
	img.src = src;
	img.onload = redo;
	return ctx.createPattern(img, 'repeat');
}

function gradient(ctx, grad)
{
	var g;
	var stops = [];
	if (grad.ctor === 'Linear')
	{
		var p0 = grad._0, p1 = grad._1;
		g = ctx.createLinearGradient(p0._0, -p0._1, p1._0, -p1._1);
		stops = _elm_lang$core$Native_List.toArray(grad._2);
	}
	else
	{
		var p0 = grad._0, p2 = grad._2;
		g = ctx.createRadialGradient(p0._0, -p0._1, grad._1, p2._0, -p2._1, grad._3);
		stops = _elm_lang$core$Native_List.toArray(grad._4);
	}
	var len = stops.length;
	for (var i = 0; i < len; ++i)
	{
		var stop = stops[i];
		g.addColorStop(stop._0, _evancz$elm_graphics$Text$colorToCss(stop._1));
	}
	return g;
}

function drawShape(redo, ctx, style, path)
{
	trace(ctx, path);
	setFillStyle(redo, ctx, style);
	ctx.scale(1, -1);
	ctx.fill();
}


// TEXT RENDERING

function fillText(redo, ctx, text)
{
	drawText(ctx, text, ctx.fillText);
}

function strokeText(redo, ctx, style, text)
{
	setStrokeStyle(ctx, style);
	// Use native canvas API for dashes only for text for now
	// Degrades to non-dashed on IE 9 + 10
	if (style.dashing.ctor !== '[]' && ctx.setLineDash)
	{
		var pattern = _elm_lang$core$Native_List.toArray(style.dashing);
		ctx.setLineDash(pattern);
	}
	drawText(ctx, text, ctx.strokeText);
}

function drawText(ctx, text, canvasDrawFn)
{
	var textChunks = chunkText(copy(defaultFacts), text);

	var totalWidth = 0;
	var maxHeight = 0;
	var numChunks = textChunks.length;

	ctx.scale(1,-1);

	for (var i = numChunks; i--; )
	{
		var chunk = textChunks[i];
		ctx.font = chunk.font;
		var metrics = ctx.measureText(chunk.text);
		chunk.width = metrics.width;
		totalWidth += chunk.width;
		if (chunk.height > maxHeight)
		{
			maxHeight = chunk.height;
		}
	}

	var x = -totalWidth / 2.0;
	for (var i = 0; i < numChunks; ++i)
	{
		var chunk = textChunks[i];
		ctx.font = chunk.font;
		ctx.fillStyle = chunk.color;
		canvasDrawFn.call(ctx, chunk.text, x, maxHeight / 2);
		x += chunk.width;
	}
}

function toFont(facts)
{
	return facts['font-style']
		+ ' ' + facts['font-variant']
		+ ' ' + facts['font-weight']
		+ ' ' + facts['font-size']
		+ ' ' + facts['font-family'];
}


// Convert the object returned by the text module
// into something we can use for styling canvas text
function chunkText(facts, text)
{
	switch (text.ctor)
	{
		case 'Append':
			var leftChunks = chunkText(copy(facts), text._0);
			var rightChunks = chunkText(copy(facts), text._1);
			return leftChunks.concat(rightChunks);

		case 'Str':
			return [{
				text: text._0,
				color: facts['color'],
				height: facts['font-size'].slice(0, -2) | 0,
				font: toFont(facts)
			}];

		case 'Link':
			return chunkText(facts, text._1);

		case 'Meta':
			facts[text._0] = text._1;
			return chunkText(facts, text._2);
	}
}

function copy(facts)
{
	return {
		'font-style': facts['font-style'],
		'font-variant': facts['font-variant'],
		'font-weight': facts['font-weight'],
		'font-size': facts['font-size'],
		'font-family': facts['font-family'],
		'color': facts['color']
	};
}

var defaultFacts = {
	'font-style': 'normal',
	'font-variant': 'normal',
	'font-weight': 'normal',
	'font-size': '12px',
	'font-family': 'sans-serif',
	'color': 'black'
};


// IMAGES

function drawImage(redo, ctx, form)
{
	var img = new Image();
	img.onload = redo;
	img.src = form._3;
	var w = form._0,
		h = form._1,
		pos = form._2,
		srcX = pos._0,
		srcY = pos._1,
		srcW = w,
		srcH = h,
		destX = -w / 2,
		destY = -h / 2,
		destW = w,
		destH = h;

	ctx.scale(1, -1);
	ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
}

function renderForm(redo, ctx, form)
{
	ctx.save();

	var x = form.x,
		y = form.y,
		theta = form.theta,
		scale = form.scale;

	if (x !== 0 || y !== 0)
	{
		ctx.translate(x, y);
	}
	if (theta !== 0)
	{
		ctx.rotate(theta % (Math.PI * 2));
	}
	if (scale !== 1)
	{
		ctx.scale(scale, scale);
	}
	if (form.alpha !== 1)
	{
		ctx.globalAlpha = ctx.globalAlpha * form.alpha;
	}

	ctx.beginPath();
	var f = form.form;
	switch (f.ctor)
	{
		case 'FPath':
			drawLine(ctx, f._0, f._1);
			break;

		case 'FImage':
			drawImage(redo, ctx, f);
			break;

		case 'FShape':
			if (f._0.ctor === 'Line')
			{
				f._1.closed = true;
				drawLine(ctx, f._0._0, f._1);
			}
			else
			{
				drawShape(redo, ctx, f._0._0, f._1);
			}
			break;

		case 'FText':
			fillText(redo, ctx, f._0);
			break;

		case 'FOutlinedText':
			strokeText(redo, ctx, f._0, f._1);
			break;
	}
	ctx.restore();
}

function formToMatrix(form)
{
	var scale = form.scale;
	var matrix = A6( _evancz$elm_graphics$Transform$matrix, scale, 0, 0, scale, form.x, form.y );

	var theta = form.theta;
	if (theta !== 0)
	{
		matrix = A2(
			_evancz$elm_graphics$Transform$multiply,
			matrix,
			_evancz$elm_graphics$Transform$rotation(theta)
		);
	}

   return matrix;
}

function str(n)
{
	if (n < 0.00001 && n > -0.00001)
	{
		return 0;
	}
	return n;
}

function makeTransform(w, h, form, matrices)
{
	var props = form.form._0._0.props;
	var m = A6(
		_evancz$elm_graphics$Transform$matrix,
		1,
		0,
		0,
		-1,
		(w - props.width ) / 2,
		(h - props.height) / 2
	);

	var len = matrices.length;
	for (var i = 0; i < len; ++i)
	{
		m = A2( _evancz$elm_graphics$Transform$multiply, m, matrices[i] );
	}
	m = A2( _evancz$elm_graphics$Transform$multiply, m, formToMatrix(form) );

	return 'matrix(' +
		str( m[0]) + ', ' + str( m[3]) + ', ' +
		str(-m[1]) + ', ' + str(-m[4]) + ', ' +
		str( m[2]) + ', ' + str( m[5]) + ')';
}

function stepperHelp(list)
{
	var arr = _elm_lang$core$Native_List.toArray(list);
	var i = 0;
	function peekNext()
	{
		return i < arr.length ? arr[i]._0.form.ctor : '';
	}
	// assumes that there is a next element
	function next()
	{
		var out = arr[i]._0;
		++i;
		return out;
	}
	return {
		peekNext: peekNext,
		next: next
	};
}

function formStepper(forms)
{
	var ps = [stepperHelp(forms)];
	var matrices = [];
	var alphas = [];
	function peekNext()
	{
		var len = ps.length;
		var formType = '';
		for (var i = 0; i < len; ++i )
		{
			if (formType = ps[i].peekNext()) return formType;
		}
		return '';
	}
	// assumes that there is a next element
	function next(ctx)
	{
		while (!ps[0].peekNext())
		{
			ps.shift();
			matrices.pop();
			alphas.shift();
			if (ctx)
			{
				ctx.restore();
			}
		}
		var out = ps[0].next();
		var f = out.form;
		if (f.ctor === 'FGroup')
		{
			ps.unshift(stepperHelp(f._1));
			var m = A2(_evancz$elm_graphics$Transform$multiply, f._0, formToMatrix(out));
			ctx.save();
			ctx.transform(m[0], m[3], m[1], m[4], m[2], m[5]);
			matrices.push(m);

			var alpha = (alphas[0] || 1) * out.alpha;
			alphas.unshift(alpha);
			ctx.globalAlpha = alpha;
		}
		return out;
	}
	function transforms()
	{
		return matrices;
	}
	function alpha()
	{
		return alphas[0] || 1;
	}
	return {
		peekNext: peekNext,
		next: next,
		transforms: transforms,
		alpha: alpha
	};
}

function makeCanvas(w, h)
{
	var canvas = _evancz$elm_graphics$Native_Element.createNode('canvas');
	canvas.style.width  = w + 'px';
	canvas.style.height = h + 'px';
	canvas.style.display = 'block';
	canvas.style.position = 'absolute';
	var ratio = window.devicePixelRatio || 1;
	canvas.width  = w * ratio;
	canvas.height = h * ratio;
	return canvas;
}

function render(model)
{
	var div = _evancz$elm_graphics$Native_Element.createNode('div');
	div.style.overflow = 'hidden';
	div.style.position = 'relative';
	update(div, model, model);
	return div;
}

function nodeStepper(w, h, div)
{
	var kids = div.childNodes;
	var i = 0;
	var ratio = window.devicePixelRatio || 1;

	function transform(transforms, ctx)
	{
		ctx.translate( w / 2 * ratio, h / 2 * ratio );
		ctx.scale( ratio, -ratio );
		var len = transforms.length;
		for (var i = 0; i < len; ++i)
		{
			var m = transforms[i];
			ctx.save();
			ctx.transform(m[0], m[3], m[1], m[4], m[2], m[5]);
		}
		return ctx;
	}
	function nextContext(transforms)
	{
		while (i < kids.length)
		{
			var node = kids[i];
			if (node.getContext)
			{
				node.width = w * ratio;
				node.height = h * ratio;
				node.style.width = w + 'px';
				node.style.height = h + 'px';
				++i;
				return transform(transforms, node.getContext('2d'));
			}
			div.removeChild(node);
		}
		var canvas = makeCanvas(w, h);
		div.appendChild(canvas);
		// we have added a new node, so we must step our position
		++i;
		return transform(transforms, canvas.getContext('2d'));
	}
	function addElement(matrices, alpha, form)
	{
		var kid = kids[i];
		var elem = form.form._0;

		var node = (!kid || kid.getContext)
			? _evancz$elm_graphics$Native_Element.render(elem)
			: _evancz$elm_graphics$Native_Element.update(kid, kid.oldElement, elem);

		node.style.position = 'absolute';
		node.style.opacity = alpha * form.alpha * elem._0.props.opacity;
		_evancz$elm_graphics$Native_Element.addTransform(node.style, makeTransform(w, h, form, matrices));
		node.oldElement = elem;
		++i;
		if (!kid)
		{
			div.appendChild(node);
		}
		else
		{
			div.insertBefore(node, kid);
		}
	}
	function clearRest()
	{
		while (i < kids.length)
		{
			div.removeChild(kids[i]);
		}
	}
	return {
		nextContext: nextContext,
		addElement: addElement,
		clearRest: clearRest
	};
}


function update(div, _, model)
{
	var w = model.w;
	var h = model.h;

	var forms = formStepper(model.forms);
	var nodes = nodeStepper(w, h, div);
	var ctx = null;
	var formType = '';

	while (formType = forms.peekNext())
	{
		// make sure we have context if we need it
		if (ctx === null && formType !== 'FElement')
		{
			ctx = nodes.nextContext(forms.transforms());
			ctx.globalAlpha = forms.alpha();
		}

		var form = forms.next(ctx);
		// if it is FGroup, all updates are made within formStepper when next is called.
		if (formType === 'FElement')
		{
			// update or insert an element, get a new context
			nodes.addElement(forms.transforms(), forms.alpha(), form);
			ctx = null;
		}
		else if (formType !== 'FGroup')
		{
			renderForm(function() { update(div, model, model); }, ctx, form);
		}
	}
	nodes.clearRest();
	return div;
}


function collage(w, h, forms)
{
	return A3(_evancz$elm_graphics$Native_Element.newElement, w, h, {
		ctor: 'Custom',
		type: 'Collage',
		render: render,
		update: update,
		model: {w: w, h: h, forms: forms}
	});
}

return {
	collage: F3(collage)
};

}();

var _evancz$elm_graphics$Native_Transform = function()
{

var A;
if (typeof Float32Array === 'undefined')
{
	A = function(arr)
	{
		this.length = arr.length;
		this[0] = arr[0];
		this[1] = arr[1];
		this[2] = arr[2];
		this[3] = arr[3];
		this[4] = arr[4];
		this[5] = arr[5];
	};
}
else
{
	A = Float32Array;
}

// layout of matrix in an array is
//
//   | m11 m12 dx |
//   | m21 m22 dy |
//   |  0   0   1 |
//
//  new A([ m11, m12, dx, m21, m22, dy ])

var identity = new A([1, 0, 0, 0, 1, 0]);

function matrix(m11, m12, m21, m22, dx, dy)
{
	return new A([m11, m12, dx, m21, m22, dy]);
}

function rotation(t)
{
	var c = Math.cos(t);
	var s = Math.sin(t);
	return new A([c, -s, 0, s, c, 0]);
}

function rotate(t, m)
{
	var c = Math.cos(t);
	var s = Math.sin(t);
	var m11 = m[0], m12 = m[1], m21 = m[3], m22 = m[4];
	return new A([
		m11 * c + m12 * s,
		-m11 * s + m12 * c,
		m[2],
		m21 * c + m22 * s,
		-m21 * s + m22 * c,
		m[5]
	]);
}

function multiply(m, n)
{
	var m11 = m[0], m12 = m[1], m21 = m[3], m22 = m[4], mdx = m[2], mdy = m[5];
	var n11 = n[0], n12 = n[1], n21 = n[3], n22 = n[4], ndx = n[2], ndy = n[5];
	return new A([
		m11 * n11 + m12 * n21,
		m11 * n12 + m12 * n22,
		m11 * ndx + m12 * ndy + mdx,
		m21 * n11 + m22 * n21,
		m21 * n12 + m22 * n22,
		m21 * ndx + m22 * ndy + mdy
	]);
}

return {
	identity: identity,
	matrix: F6(matrix),
	rotation: rotation,
	multiply: F2(multiply)
};

}();

var _evancz$elm_graphics$Transform$multiply = _evancz$elm_graphics$Native_Transform.multiply;
var _evancz$elm_graphics$Transform$rotation = _evancz$elm_graphics$Native_Transform.rotation;
var _evancz$elm_graphics$Transform$matrix = _evancz$elm_graphics$Native_Transform.matrix;
var _evancz$elm_graphics$Transform$translation = F2(
	function (x, y) {
		return A6(_evancz$elm_graphics$Transform$matrix, 1, 0, 0, 1, x, y);
	});
var _evancz$elm_graphics$Transform$scale = function (s) {
	return A6(_evancz$elm_graphics$Transform$matrix, s, 0, 0, s, 0, 0);
};
var _evancz$elm_graphics$Transform$scaleX = function (x) {
	return A6(_evancz$elm_graphics$Transform$matrix, x, 0, 0, 1, 0, 0);
};
var _evancz$elm_graphics$Transform$scaleY = function (y) {
	return A6(_evancz$elm_graphics$Transform$matrix, 1, 0, 0, y, 0, 0);
};
var _evancz$elm_graphics$Transform$identity = _evancz$elm_graphics$Native_Transform.identity;
var _evancz$elm_graphics$Transform$Transform = {ctor: 'Transform'};

var _evancz$elm_graphics$Collage$collage = _evancz$elm_graphics$Native_Collage.collage;
var _evancz$elm_graphics$Collage$LineStyle = F6(
	function (a, b, c, d, e, f) {
		return {color: a, width: b, cap: c, join: d, dashing: e, dashOffset: f};
	});
var _evancz$elm_graphics$Collage$Form_elm_builtin = function (a) {
	return {ctor: 'Form_elm_builtin', _0: a};
};
var _evancz$elm_graphics$Collage$form = function (f) {
	return _evancz$elm_graphics$Collage$Form_elm_builtin(
		{theta: 0, scale: 1, x: 0, y: 0, alpha: 1, form: f});
};
var _evancz$elm_graphics$Collage$move = F2(
	function (_p1, _p0) {
		var _p2 = _p1;
		var _p3 = _p0;
		var _p4 = _p3._0;
		return _evancz$elm_graphics$Collage$Form_elm_builtin(
			_elm_lang$core$Native_Utils.update(
				_p4,
				{x: _p4.x + _p2._0, y: _p4.y + _p2._1}));
	});
var _evancz$elm_graphics$Collage$moveX = F2(
	function (x, _p5) {
		var _p6 = _p5;
		var _p7 = _p6._0;
		return _evancz$elm_graphics$Collage$Form_elm_builtin(
			_elm_lang$core$Native_Utils.update(
				_p7,
				{x: _p7.x + x}));
	});
var _evancz$elm_graphics$Collage$moveY = F2(
	function (y, _p8) {
		var _p9 = _p8;
		var _p10 = _p9._0;
		return _evancz$elm_graphics$Collage$Form_elm_builtin(
			_elm_lang$core$Native_Utils.update(
				_p10,
				{y: _p10.y + y}));
	});
var _evancz$elm_graphics$Collage$scale = F2(
	function (s, _p11) {
		var _p12 = _p11;
		var _p13 = _p12._0;
		return _evancz$elm_graphics$Collage$Form_elm_builtin(
			_elm_lang$core$Native_Utils.update(
				_p13,
				{scale: _p13.scale * s}));
	});
var _evancz$elm_graphics$Collage$rotate = F2(
	function (t, _p14) {
		var _p15 = _p14;
		var _p16 = _p15._0;
		return _evancz$elm_graphics$Collage$Form_elm_builtin(
			_elm_lang$core$Native_Utils.update(
				_p16,
				{theta: _p16.theta + t}));
	});
var _evancz$elm_graphics$Collage$alpha = F2(
	function (a, _p17) {
		var _p18 = _p17;
		return _evancz$elm_graphics$Collage$Form_elm_builtin(
			_elm_lang$core$Native_Utils.update(
				_p18._0,
				{alpha: a}));
	});
var _evancz$elm_graphics$Collage$Grad = function (a) {
	return {ctor: 'Grad', _0: a};
};
var _evancz$elm_graphics$Collage$Texture = function (a) {
	return {ctor: 'Texture', _0: a};
};
var _evancz$elm_graphics$Collage$Solid = function (a) {
	return {ctor: 'Solid', _0: a};
};
var _evancz$elm_graphics$Collage$Padded = {ctor: 'Padded'};
var _evancz$elm_graphics$Collage$Round = {ctor: 'Round'};
var _evancz$elm_graphics$Collage$Flat = {ctor: 'Flat'};
var _evancz$elm_graphics$Collage$Clipped = {ctor: 'Clipped'};
var _evancz$elm_graphics$Collage$Sharp = function (a) {
	return {ctor: 'Sharp', _0: a};
};
var _evancz$elm_graphics$Collage$defaultLine = {
	color: _elm_lang$core$Color$black,
	width: 1,
	cap: _evancz$elm_graphics$Collage$Flat,
	join: _evancz$elm_graphics$Collage$Sharp(10),
	dashing: {ctor: '[]'},
	dashOffset: 0
};
var _evancz$elm_graphics$Collage$solid = function (clr) {
	return _elm_lang$core$Native_Utils.update(
		_evancz$elm_graphics$Collage$defaultLine,
		{color: clr});
};
var _evancz$elm_graphics$Collage$dashed = function (clr) {
	return _elm_lang$core$Native_Utils.update(
		_evancz$elm_graphics$Collage$defaultLine,
		{
			color: clr,
			dashing: {
				ctor: '::',
				_0: 8,
				_1: {
					ctor: '::',
					_0: 4,
					_1: {ctor: '[]'}
				}
			}
		});
};
var _evancz$elm_graphics$Collage$dotted = function (clr) {
	return _elm_lang$core$Native_Utils.update(
		_evancz$elm_graphics$Collage$defaultLine,
		{
			color: clr,
			dashing: {
				ctor: '::',
				_0: 3,
				_1: {
					ctor: '::',
					_0: 3,
					_1: {ctor: '[]'}
				}
			}
		});
};
var _evancz$elm_graphics$Collage$Smooth = {ctor: 'Smooth'};
var _evancz$elm_graphics$Collage$FGroup = F2(
	function (a, b) {
		return {ctor: 'FGroup', _0: a, _1: b};
	});
var _evancz$elm_graphics$Collage$group = function (fs) {
	return _evancz$elm_graphics$Collage$form(
		A2(_evancz$elm_graphics$Collage$FGroup, _evancz$elm_graphics$Transform$identity, fs));
};
var _evancz$elm_graphics$Collage$groupTransform = F2(
	function (matrix, fs) {
		return _evancz$elm_graphics$Collage$form(
			A2(_evancz$elm_graphics$Collage$FGroup, matrix, fs));
	});
var _evancz$elm_graphics$Collage$FElement = function (a) {
	return {ctor: 'FElement', _0: a};
};
var _evancz$elm_graphics$Collage$toForm = function (e) {
	return _evancz$elm_graphics$Collage$form(
		_evancz$elm_graphics$Collage$FElement(e));
};
var _evancz$elm_graphics$Collage$FImage = F4(
	function (a, b, c, d) {
		return {ctor: 'FImage', _0: a, _1: b, _2: c, _3: d};
	});
var _evancz$elm_graphics$Collage$sprite = F4(
	function (w, h, pos, src) {
		return _evancz$elm_graphics$Collage$form(
			A4(_evancz$elm_graphics$Collage$FImage, w, h, pos, src));
	});
var _evancz$elm_graphics$Collage$FText = function (a) {
	return {ctor: 'FText', _0: a};
};
var _evancz$elm_graphics$Collage$text = function (t) {
	return _evancz$elm_graphics$Collage$form(
		_evancz$elm_graphics$Collage$FText(t));
};
var _evancz$elm_graphics$Collage$FOutlinedText = F2(
	function (a, b) {
		return {ctor: 'FOutlinedText', _0: a, _1: b};
	});
var _evancz$elm_graphics$Collage$outlinedText = F2(
	function (ls, t) {
		return _evancz$elm_graphics$Collage$form(
			A2(_evancz$elm_graphics$Collage$FOutlinedText, ls, t));
	});
var _evancz$elm_graphics$Collage$FShape = F2(
	function (a, b) {
		return {ctor: 'FShape', _0: a, _1: b};
	});
var _evancz$elm_graphics$Collage$FPath = F2(
	function (a, b) {
		return {ctor: 'FPath', _0: a, _1: b};
	});
var _evancz$elm_graphics$Collage$traced = F2(
	function (style, _p19) {
		var _p20 = _p19;
		return _evancz$elm_graphics$Collage$form(
			A2(_evancz$elm_graphics$Collage$FPath, style, _p20._0));
	});
var _evancz$elm_graphics$Collage$Fill = function (a) {
	return {ctor: 'Fill', _0: a};
};
var _evancz$elm_graphics$Collage$fill = F2(
	function (style, _p21) {
		var _p22 = _p21;
		return _evancz$elm_graphics$Collage$form(
			A2(
				_evancz$elm_graphics$Collage$FShape,
				_evancz$elm_graphics$Collage$Fill(style),
				_p22._0));
	});
var _evancz$elm_graphics$Collage$filled = F2(
	function (color, shape) {
		return A2(
			_evancz$elm_graphics$Collage$fill,
			_evancz$elm_graphics$Collage$Solid(color),
			shape);
	});
var _evancz$elm_graphics$Collage$textured = F2(
	function (src, shape) {
		return A2(
			_evancz$elm_graphics$Collage$fill,
			_evancz$elm_graphics$Collage$Texture(src),
			shape);
	});
var _evancz$elm_graphics$Collage$gradient = F2(
	function (grad, shape) {
		return A2(
			_evancz$elm_graphics$Collage$fill,
			_evancz$elm_graphics$Collage$Grad(grad),
			shape);
	});
var _evancz$elm_graphics$Collage$Line = function (a) {
	return {ctor: 'Line', _0: a};
};
var _evancz$elm_graphics$Collage$outlined = F2(
	function (style, _p23) {
		var _p24 = _p23;
		return _evancz$elm_graphics$Collage$form(
			A2(
				_evancz$elm_graphics$Collage$FShape,
				_evancz$elm_graphics$Collage$Line(style),
				_p24._0));
	});
var _evancz$elm_graphics$Collage$Path = function (a) {
	return {ctor: 'Path', _0: a};
};
var _evancz$elm_graphics$Collage$path = function (ps) {
	return _evancz$elm_graphics$Collage$Path(ps);
};
var _evancz$elm_graphics$Collage$segment = F2(
	function (p1, p2) {
		return _evancz$elm_graphics$Collage$Path(
			{
				ctor: '::',
				_0: p1,
				_1: {
					ctor: '::',
					_0: p2,
					_1: {ctor: '[]'}
				}
			});
	});
var _evancz$elm_graphics$Collage$Shape = function (a) {
	return {ctor: 'Shape', _0: a};
};
var _evancz$elm_graphics$Collage$polygon = function (points) {
	return _evancz$elm_graphics$Collage$Shape(points);
};
var _evancz$elm_graphics$Collage$rect = F2(
	function (w, h) {
		var hh = h / 2;
		var hw = w / 2;
		return _evancz$elm_graphics$Collage$Shape(
			{
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 0 - hw, _1: 0 - hh},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 0 - hw, _1: hh},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: hw, _1: hh},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: hw, _1: 0 - hh},
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _evancz$elm_graphics$Collage$square = function (n) {
	return A2(_evancz$elm_graphics$Collage$rect, n, n);
};
var _evancz$elm_graphics$Collage$oval = F2(
	function (w, h) {
		var hh = h / 2;
		var hw = w / 2;
		var n = 50;
		var t = (2 * _elm_lang$core$Basics$pi) / n;
		var f = function (i) {
			return {
				ctor: '_Tuple2',
				_0: hw * _elm_lang$core$Basics$cos(
					t * _elm_lang$core$Basics$toFloat(i)),
				_1: hh * _elm_lang$core$Basics$sin(
					t * _elm_lang$core$Basics$toFloat(i))
			};
		};
		return _evancz$elm_graphics$Collage$Shape(
			A2(
				_elm_lang$core$List$map,
				f,
				A2(_elm_lang$core$List$range, 0, n - 1)));
	});
var _evancz$elm_graphics$Collage$circle = function (r) {
	return A2(_evancz$elm_graphics$Collage$oval, 2 * r, 2 * r);
};
var _evancz$elm_graphics$Collage$ngon = F2(
	function (n, r) {
		var m = _elm_lang$core$Basics$toFloat(n);
		var t = (2 * _elm_lang$core$Basics$pi) / m;
		var f = function (i) {
			return {
				ctor: '_Tuple2',
				_0: r * _elm_lang$core$Basics$cos(
					t * _elm_lang$core$Basics$toFloat(i)),
				_1: r * _elm_lang$core$Basics$sin(
					t * _elm_lang$core$Basics$toFloat(i))
			};
		};
		return _evancz$elm_graphics$Collage$Shape(
			A2(
				_elm_lang$core$List$map,
				f,
				A2(_elm_lang$core$List$range, 0, n - 1)));
	});

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

var _minond$brainloller$Brainloller_Lang$getBlCmd = F2(
	function (key, dict) {
		var _p0 = key;
		switch (_p0) {
			case 'shiftRight':
				return dict.shiftRight;
			case 'shiftLeft':
				return dict.shiftLeft;
			case 'increment':
				return dict.increment;
			case 'decrement':
				return dict.decrement;
			case 'ioWrite':
				return dict.ioWrite;
			case 'ioRead':
				return dict.ioRead;
			case 'loopOpen':
				return dict.loopOpen;
			case 'loopClose':
				return dict.loopClose;
			case 'rotateClockwise':
				return dict.rotateClockwise;
			case 'rotateCounterClockwise':
				return dict.rotateCounterClockwise;
			default:
				return dict.noop;
		}
	});
var _minond$brainloller$Brainloller_Lang$blCmd = {shiftRight: 'shiftRight', shiftLeft: 'shiftLeft', increment: 'increment', decrement: 'decrement', ioWrite: 'ioWrite', ioRead: 'ioRead', loopOpen: 'loopOpen', loopClose: 'loopClose', rotateClockwise: 'rotateClockwise', rotateCounterClockwise: 'rotateCounterClockwise', noop: 'noop'};
var _minond$brainloller$Brainloller_Lang$pixel = F3(
	function (r, g, b) {
		return {r: r, g: g, b: b};
	});
var _minond$brainloller$Brainloller_Lang$blCmdPixel = {
	shiftRight: A3(_minond$brainloller$Brainloller_Lang$pixel, 255, 0, 0),
	shiftLeft: A3(_minond$brainloller$Brainloller_Lang$pixel, 128, 0, 0),
	increment: A3(_minond$brainloller$Brainloller_Lang$pixel, 0, 255, 0),
	decrement: A3(_minond$brainloller$Brainloller_Lang$pixel, 0, 128, 0),
	ioWrite: A3(_minond$brainloller$Brainloller_Lang$pixel, 0, 0, 255),
	ioRead: A3(_minond$brainloller$Brainloller_Lang$pixel, 0, 0, 128),
	loopOpen: A3(_minond$brainloller$Brainloller_Lang$pixel, 255, 255, 0),
	loopClose: A3(_minond$brainloller$Brainloller_Lang$pixel, 128, 128, 0),
	rotateClockwise: A3(_minond$brainloller$Brainloller_Lang$pixel, 0, 255, 255),
	rotateCounterClockwise: A3(_minond$brainloller$Brainloller_Lang$pixel, 0, 128, 128),
	noop: A3(_minond$brainloller$Brainloller_Lang$pixel, 0, 0, 0)
};
var _minond$brainloller$Brainloller_Lang$BLCmd = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {shiftRight: a, shiftLeft: b, increment: c, decrement: d, ioWrite: e, ioRead: f, loopOpen: g, loopClose: h, rotateClockwise: i, rotateCounterClockwise: j, noop: k};
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
var _minond$brainloller$Brainloller_Lang$Pixel = F3(
	function (a, b, c) {
		return {r: a, g: b, b: c};
	});

var _minond$brainloller$Util$mapBoth = F2(
	function (fn, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: fn(_p1._0),
			_1: fn(_p1._1)
		};
	});
var _minond$brainloller$Util$ternary = F3(
	function (cond, pass, fail) {
		return cond ? pass : fail;
	});
var _minond$brainloller$Util$asList = function (list) {
	return A2(
		_elm_lang$core$Maybe$withDefault,
		{ctor: '[]'},
		list);
};

var _minond$brainloller$Brainloller_Pixel$commandsForm = F2(
	function (cmdSetter, activeCmd) {
		var picker = F2(
			function (label, cmd) {
				return A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Events$onClick(
							cmdSetter(cmd)),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$tabindex(1),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$title(label),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$classList(
										{
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'cmd-btn', _1: true},
											_1: {
												ctor: '::',
												_0: {
													ctor: '_Tuple2',
													_0: 'cmd-btn-active',
													_1: _elm_lang$core$Native_Utils.eq(cmd, activeCmd)
												},
												_1: {
													ctor: '::',
													_0: {
														ctor: '_Tuple2',
														_0: A2(_elm_lang$core$Basics_ops['++'], 'cmd-btn--', cmd),
														_1: true
													},
													_1: {ctor: '[]'}
												}
											}
										}),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{ctor: '[]'});
			});
		return {
			ctor: '::',
			_0: A2(picker, '>', _minond$brainloller$Brainloller_Lang$blCmd.shiftRight),
			_1: {
				ctor: '::',
				_0: A2(picker, '<', _minond$brainloller$Brainloller_Lang$blCmd.shiftLeft),
				_1: {
					ctor: '::',
					_0: A2(picker, '+', _minond$brainloller$Brainloller_Lang$blCmd.increment),
					_1: {
						ctor: '::',
						_0: A2(picker, '-', _minond$brainloller$Brainloller_Lang$blCmd.decrement),
						_1: {
							ctor: '::',
							_0: A2(picker, '.', _minond$brainloller$Brainloller_Lang$blCmd.ioWrite),
							_1: {
								ctor: '::',
								_0: A2(picker, ',', _minond$brainloller$Brainloller_Lang$blCmd.ioRead),
								_1: {
									ctor: '::',
									_0: A2(picker, '[', _minond$brainloller$Brainloller_Lang$blCmd.loopOpen),
									_1: {
										ctor: '::',
										_0: A2(picker, ']', _minond$brainloller$Brainloller_Lang$blCmd.loopClose),
										_1: {
											ctor: '::',
											_0: A2(picker, '+90', _minond$brainloller$Brainloller_Lang$blCmd.rotateClockwise),
											_1: {
												ctor: '::',
												_0: A2(picker, '-90', _minond$brainloller$Brainloller_Lang$blCmd.rotateCounterClockwise),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		};
	});
var _minond$brainloller$Brainloller_Pixel$pixelForm = F3(
	function (board, index, pixel) {
		var color = A3(_elm_lang$core$Color$rgb, pixel.r, pixel.g, pixel.b);
		var y = (((index / board.width) | 0) * board.cellSize) + board.startY;
		var x = (A2(_elm_lang$core$Basics$rem, index, board.width) * board.cellSize) - board.startX;
		var point = {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Basics$toFloat(x),
			_1: _elm_lang$core$Basics$toFloat(y)
		};
		return A2(
			_evancz$elm_graphics$Collage$move,
			point,
			A2(
				_evancz$elm_graphics$Collage$filled,
				color,
				_evancz$elm_graphics$Collage$square(20)));
	});
var _minond$brainloller$Brainloller_Pixel$programForm = function (program) {
	var continuous = A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return A2(_elm_lang$core$Basics_ops['++'], x, y);
			}),
		{ctor: '[]'},
		program);
	var width = A2(
		_elm_lang$core$Maybe$withDefault,
		0,
		A2(
			_elm_lang$core$Maybe$andThen,
			function (row) {
				return _elm_lang$core$Maybe$Just(
					_elm_lang$core$List$length(row));
			},
			_elm_lang$core$List$head(program)));
	var height = _elm_lang$core$List$length(program);
	var cellSize = 20;
	var startX = ((width / 2) | 0) * cellSize;
	var startY = (((height / 2) | 0) * cellSize) * -1;
	var board = {cellSize: cellSize, width: width, startX: ((width / 2) | 0) * cellSize, startY: startY};
	var processPixel = F2(
		function (index, pixel) {
			return A3(_minond$brainloller$Brainloller_Pixel$pixelForm, board, index, pixel);
		});
	return A2(_elm_lang$core$List$indexedMap, processPixel, continuous);
};
var _minond$brainloller$Brainloller_Pixel$programDimensions = function (program) {
	var width = A2(
		_elm_lang$core$Maybe$withDefault,
		0,
		A2(
			_elm_lang$core$Maybe$andThen,
			function (row) {
				return _elm_lang$core$Maybe$Just(
					_elm_lang$core$List$length(row));
			},
			_elm_lang$core$List$head(program)));
	var height = _elm_lang$core$List$length(program);
	return {ctor: '_Tuple2', _0: width, _1: height};
};
var _minond$brainloller$Brainloller_Pixel$getCellMaybe = F3(
	function (program, x, y) {
		return A2(
			_elm_community$list_extra$List_Extra$getAt,
			x,
			_minond$brainloller$Util$asList(
				A2(_elm_community$list_extra$List_Extra$getAt, y, program)));
	});
var _minond$brainloller$Brainloller_Pixel$getCellAt = F3(
	function (program, x, y) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			{r: 255, g: 255, b: 255},
			A3(_minond$brainloller$Brainloller_Pixel$getCellMaybe, program, x, y));
	});
var _minond$brainloller$Brainloller_Pixel$resizeProgram = F3(
	function (program, x, y) {
		var dims = _minond$brainloller$Brainloller_Pixel$programDimensions(program);
		var width = A2(
			_elm_lang$core$Basics$max,
			x + 1,
			_elm_lang$core$Tuple$first(dims));
		var height = A2(
			_elm_lang$core$Basics$max,
			y + 1,
			_elm_lang$core$Tuple$second(dims));
		return A2(
			_elm_lang$core$List$indexedMap,
			F2(
				function (y, _p0) {
					return A2(
						_elm_lang$core$List$indexedMap,
						F2(
							function (x, _p1) {
								return A3(_minond$brainloller$Brainloller_Pixel$getCellAt, program, x, y);
							}),
						A2(_elm_lang$core$List$repeat, width, _elm_lang$core$Maybe$Nothing));
				}),
			A2(_elm_lang$core$List$repeat, height, _elm_lang$core$Maybe$Nothing));
	});
var _minond$brainloller$Brainloller_Pixel$setCellAt = F4(
	function (program, x, y, p) {
		var row = _minond$brainloller$Util$asList(
			A2(_elm_community$list_extra$List_Extra$getAt, y, program));
		var updatedRow = _minond$brainloller$Util$asList(
			A3(_elm_community$list_extra$List_Extra$setAt, x, p, row));
		var updatedProgram = _minond$brainloller$Util$asList(
			A3(_elm_community$list_extra$List_Extra$setAt, y, updatedRow, program));
		return updatedProgram;
	});
var _minond$brainloller$Brainloller_Pixel$pixelStyle = function (p) {
	return {
		ctor: '_Tuple2',
		_0: 'backgroundColor',
		_1: A2(
			_elm_lang$core$Basics_ops['++'],
			'rgb(',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(p.r),
				A2(
					_elm_lang$core$Basics_ops['++'],
					', ',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(p.g),
						A2(
							_elm_lang$core$Basics_ops['++'],
							', ',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(p.b),
								')'))))))
	};
};
var _minond$brainloller$Brainloller_Pixel$programCells = F6(
	function (width, height, program, writeHandler, enableHandler, disableHandler) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Events$onMouseDown(enableHandler),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onMouseUp(disableHandler),
					_1: {ctor: '[]'}
				}
			},
			A2(
				_elm_lang$core$List$indexedMap,
				F2(
					function (rowIndex, row) {
						return row(
							A2(
								_elm_lang$core$List$indexedMap,
								F2(
									function (cellIndex, cell) {
										var pixel = A3(_minond$brainloller$Brainloller_Pixel$getCellAt, program, cellIndex, rowIndex);
										return A2(
											cell,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('program-cell'),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html_Events$onClick(
														A3(writeHandler, cellIndex, rowIndex, true)),
													_1: {
														ctor: '::',
														_0: _elm_lang$html$Html_Events$onMouseDown(
															A3(writeHandler, cellIndex, rowIndex, true)),
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html_Events$onMouseOver(
																A3(writeHandler, cellIndex, rowIndex, false)),
															_1: {
																ctor: '::',
																_0: _elm_lang$html$Html_Attributes$style(
																	{
																		ctor: '::',
																		_0: _minond$brainloller$Brainloller_Pixel$pixelStyle(pixel),
																		_1: {ctor: '[]'}
																	}),
																_1: {ctor: '[]'}
															}
														}
													}
												}
											},
											{ctor: '[]'});
									}),
								A2(_elm_lang$core$List$repeat, width, _elm_lang$html$Html$div)));
					}),
				A2(
					_elm_lang$core$List$repeat,
					height,
					_elm_lang$html$Html$div(
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('program-row'),
							_1: {ctor: '[]'}
						}))));
	});
var _minond$brainloller$Brainloller_Pixel$pixelColor = function (_p2) {
	var _p3 = _p2;
	return A3(_elm_lang$core$Color$rgb, _p3.r, _p3.g, _p3.b);
};
var _minond$brainloller$Brainloller_Pixel$BoardConfig = F4(
	function (a, b, c, d) {
		return {cellSize: a, width: b, startX: c, startY: d};
	});

var _minond$brainloller$Brainloller_Program$progHelloWorld = {
	ctor: '::',
	_0: {
		ctor: '::',
		_0: {r: 255, g: 0, b: 0},
		_1: {
			ctor: '::',
			_0: {r: 0, g: 255, b: 0},
			_1: {
				ctor: '::',
				_0: {r: 0, g: 255, b: 0},
				_1: {
					ctor: '::',
					_0: {r: 0, g: 255, b: 0},
					_1: {
						ctor: '::',
						_0: {r: 0, g: 255, b: 0},
						_1: {
							ctor: '::',
							_0: {r: 0, g: 255, b: 0},
							_1: {
								ctor: '::',
								_0: {r: 0, g: 255, b: 0},
								_1: {
									ctor: '::',
									_0: {r: 0, g: 255, b: 0},
									_1: {
										ctor: '::',
										_0: {r: 0, g: 255, b: 0},
										_1: {
											ctor: '::',
											_0: {r: 0, g: 255, b: 0},
											_1: {
												ctor: '::',
												_0: {r: 255, g: 255, b: 0},
												_1: {
													ctor: '::',
													_0: {r: 128, g: 0, b: 0},
													_1: {
														ctor: '::',
														_0: {r: 0, g: 255, b: 0},
														_1: {
															ctor: '::',
															_0: {r: 0, g: 255, b: 255},
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	},
	_1: {
		ctor: '::',
		_0: {
			ctor: '::',
			_0: {r: 0, g: 128, b: 128},
			_1: {
				ctor: '::',
				_0: {r: 0, g: 0, b: 255},
				_1: {
					ctor: '::',
					_0: {r: 128, g: 0, b: 0},
					_1: {
						ctor: '::',
						_0: {r: 128, g: 128, b: 0},
						_1: {
							ctor: '::',
							_0: {r: 0, g: 128, b: 0},
							_1: {
								ctor: '::',
								_0: {r: 255, g: 0, b: 0},
								_1: {
									ctor: '::',
									_0: {r: 0, g: 255, b: 0},
									_1: {
										ctor: '::',
										_0: {r: 0, g: 255, b: 0},
										_1: {
											ctor: '::',
											_0: {r: 0, g: 255, b: 0},
											_1: {
												ctor: '::',
												_0: {r: 0, g: 255, b: 0},
												_1: {
													ctor: '::',
													_0: {r: 0, g: 255, b: 0},
													_1: {
														ctor: '::',
														_0: {r: 0, g: 255, b: 0},
														_1: {
															ctor: '::',
															_0: {r: 0, g: 255, b: 0},
															_1: {
																ctor: '::',
																_0: {r: 0, g: 255, b: 255},
																_1: {ctor: '[]'}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		},
		_1: {
			ctor: '::',
			_0: {
				ctor: '::',
				_0: {r: 0, g: 128, b: 128},
				_1: {
					ctor: '::',
					_0: {r: 255, g: 0, b: 0},
					_1: {
						ctor: '::',
						_0: {r: 0, g: 255, b: 0},
						_1: {
							ctor: '::',
							_0: {r: 0, g: 255, b: 0},
							_1: {
								ctor: '::',
								_0: {r: 0, g: 255, b: 0},
								_1: {
									ctor: '::',
									_0: {r: 0, g: 255, b: 0},
									_1: {
										ctor: '::',
										_0: {r: 0, g: 255, b: 0},
										_1: {
											ctor: '::',
											_0: {r: 0, g: 255, b: 0},
											_1: {
												ctor: '::',
												_0: {r: 0, g: 255, b: 0},
												_1: {
													ctor: '::',
													_0: {r: 255, g: 255, b: 0},
													_1: {
														ctor: '::',
														_0: {r: 128, g: 0, b: 0},
														_1: {
															ctor: '::',
															_0: {r: 0, g: 255, b: 0},
															_1: {
																ctor: '::',
																_0: {r: 0, g: 255, b: 0},
																_1: {
																	ctor: '::',
																	_0: {r: 0, g: 255, b: 255},
																	_1: {ctor: '[]'}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '::',
					_0: {r: 0, g: 128, b: 128},
					_1: {
						ctor: '::',
						_0: {r: 0, g: 255, b: 0},
						_1: {
							ctor: '::',
							_0: {r: 0, g: 255, b: 0},
							_1: {
								ctor: '::',
								_0: {r: 0, g: 255, b: 0},
								_1: {
									ctor: '::',
									_0: {r: 0, g: 255, b: 0},
									_1: {
										ctor: '::',
										_0: {r: 0, g: 0, b: 255},
										_1: {
											ctor: '::',
											_0: {r: 0, g: 255, b: 0},
											_1: {
												ctor: '::',
												_0: {r: 128, g: 0, b: 0},
												_1: {
													ctor: '::',
													_0: {r: 128, g: 128, b: 0},
													_1: {
														ctor: '::',
														_0: {r: 0, g: 128, b: 0},
														_1: {
															ctor: '::',
															_0: {r: 255, g: 0, b: 0},
															_1: {
																ctor: '::',
																_0: {r: 0, g: 255, b: 0},
																_1: {
																	ctor: '::',
																	_0: {r: 0, g: 255, b: 0},
																	_1: {
																		ctor: '::',
																		_0: {r: 0, g: 255, b: 255},
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '::',
						_0: {r: 0, g: 128, b: 128},
						_1: {
							ctor: '::',
							_0: {r: 0, g: 255, b: 0},
							_1: {
								ctor: '::',
								_0: {r: 0, g: 255, b: 0},
								_1: {
									ctor: '::',
									_0: {r: 0, g: 255, b: 0},
									_1: {
										ctor: '::',
										_0: {r: 0, g: 0, b: 255},
										_1: {
											ctor: '::',
											_0: {r: 0, g: 0, b: 255},
											_1: {
												ctor: '::',
												_0: {r: 0, g: 255, b: 0},
												_1: {
													ctor: '::',
													_0: {r: 0, g: 255, b: 0},
													_1: {
														ctor: '::',
														_0: {r: 0, g: 255, b: 0},
														_1: {
															ctor: '::',
															_0: {r: 0, g: 0, b: 255},
															_1: {
																ctor: '::',
																_0: {r: 255, g: 0, b: 0},
																_1: {
																	ctor: '::',
																	_0: {r: 255, g: 0, b: 0},
																	_1: {
																		ctor: '::',
																		_0: {r: 255, g: 0, b: 0},
																		_1: {
																			ctor: '::',
																			_0: {r: 0, g: 255, b: 255},
																			_1: {ctor: '[]'}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '::',
							_0: {r: 0, g: 128, b: 128},
							_1: {
								ctor: '::',
								_0: {r: 0, g: 255, b: 0},
								_1: {
									ctor: '::',
									_0: {r: 0, g: 255, b: 0},
									_1: {
										ctor: '::',
										_0: {r: 128, g: 0, b: 0},
										_1: {
											ctor: '::',
											_0: {r: 255, g: 255, b: 0},
											_1: {
												ctor: '::',
												_0: {r: 0, g: 255, b: 0},
												_1: {
													ctor: '::',
													_0: {r: 0, g: 255, b: 0},
													_1: {
														ctor: '::',
														_0: {r: 0, g: 255, b: 0},
														_1: {
															ctor: '::',
															_0: {r: 0, g: 255, b: 0},
															_1: {
																ctor: '::',
																_0: {r: 0, g: 255, b: 0},
																_1: {
																	ctor: '::',
																	_0: {r: 0, g: 255, b: 0},
																	_1: {
																		ctor: '::',
																		_0: {r: 0, g: 255, b: 0},
																		_1: {
																			ctor: '::',
																			_0: {r: 0, g: 255, b: 0},
																			_1: {
																				ctor: '::',
																				_0: {r: 0, g: 255, b: 255},
																				_1: {ctor: '[]'}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '::',
								_0: {r: 0, g: 128, b: 128},
								_1: {
									ctor: '::',
									_0: {r: 0, g: 255, b: 0},
									_1: {
										ctor: '::',
										_0: {r: 0, g: 255, b: 0},
										_1: {
											ctor: '::',
											_0: {r: 255, g: 0, b: 0},
											_1: {
												ctor: '::',
												_0: {r: 0, g: 128, b: 0},
												_1: {
													ctor: '::',
													_0: {r: 128, g: 128, b: 0},
													_1: {
														ctor: '::',
														_0: {r: 128, g: 0, b: 0},
														_1: {
															ctor: '::',
															_0: {r: 0, g: 0, b: 255},
															_1: {
																ctor: '::',
																_0: {r: 255, g: 0, b: 0},
																_1: {
																	ctor: '::',
																	_0: {r: 255, g: 0, b: 0},
																	_1: {
																		ctor: '::',
																		_0: {r: 255, g: 0, b: 0},
																		_1: {
																			ctor: '::',
																			_0: {r: 0, g: 255, b: 0},
																			_1: {
																				ctor: '::',
																				_0: {r: 0, g: 255, b: 0},
																				_1: {
																					ctor: '::',
																					_0: {r: 0, g: 255, b: 255},
																					_1: {ctor: '[]'}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '::',
									_0: {r: 0, g: 128, b: 128},
									_1: {
										ctor: '::',
										_0: {r: 0, g: 255, b: 0},
										_1: {
											ctor: '::',
											_0: {r: 0, g: 255, b: 0},
											_1: {
												ctor: '::',
												_0: {r: 128, g: 0, b: 0},
												_1: {
													ctor: '::',
													_0: {r: 255, g: 255, b: 0},
													_1: {
														ctor: '::',
														_0: {r: 0, g: 255, b: 0},
														_1: {
															ctor: '::',
															_0: {r: 0, g: 255, b: 0},
															_1: {
																ctor: '::',
																_0: {r: 0, g: 255, b: 0},
																_1: {
																	ctor: '::',
																	_0: {r: 0, g: 255, b: 0},
																	_1: {
																		ctor: '::',
																		_0: {r: 0, g: 255, b: 0},
																		_1: {
																			ctor: '::',
																			_0: {r: 0, g: 255, b: 0},
																			_1: {
																				ctor: '::',
																				_0: {r: 0, g: 255, b: 0},
																				_1: {
																					ctor: '::',
																					_0: {r: 0, g: 255, b: 0},
																					_1: {
																						ctor: '::',
																						_0: {r: 0, g: 255, b: 255},
																						_1: {ctor: '[]'}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								},
								_1: {
									ctor: '::',
									_0: {
										ctor: '::',
										_0: {r: 0, g: 128, b: 128},
										_1: {
											ctor: '::',
											_0: {r: 0, g: 255, b: 0},
											_1: {
												ctor: '::',
												_0: {r: 0, g: 255, b: 0},
												_1: {
													ctor: '::',
													_0: {r: 0, g: 255, b: 0},
													_1: {
														ctor: '::',
														_0: {r: 0, g: 255, b: 0},
														_1: {
															ctor: '::',
															_0: {r: 0, g: 255, b: 0},
															_1: {
																ctor: '::',
																_0: {r: 0, g: 255, b: 0},
																_1: {
																	ctor: '::',
																	_0: {r: 0, g: 255, b: 0},
																	_1: {
																		ctor: '::',
																		_0: {r: 255, g: 0, b: 0},
																		_1: {
																			ctor: '::',
																			_0: {r: 0, g: 128, b: 0},
																			_1: {
																				ctor: '::',
																				_0: {r: 128, g: 128, b: 0},
																				_1: {
																					ctor: '::',
																					_0: {r: 128, g: 0, b: 0},
																					_1: {
																						ctor: '::',
																						_0: {r: 0, g: 128, b: 0},
																						_1: {
																							ctor: '::',
																							_0: {r: 0, g: 255, b: 255},
																							_1: {ctor: '[]'}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									},
									_1: {
										ctor: '::',
										_0: {
											ctor: '::',
											_0: {r: 0, g: 128, b: 128},
											_1: {
												ctor: '::',
												_0: {r: 0, g: 0, b: 255},
												_1: {
													ctor: '::',
													_0: {r: 0, g: 255, b: 0},
													_1: {
														ctor: '::',
														_0: {r: 0, g: 255, b: 0},
														_1: {
															ctor: '::',
															_0: {r: 0, g: 255, b: 0},
															_1: {
																ctor: '::',
																_0: {r: 0, g: 0, b: 255},
																_1: {
																	ctor: '::',
																	_0: {r: 128, g: 0, b: 0},
																	_1: {
																		ctor: '::',
																		_0: {r: 128, g: 0, b: 0},
																		_1: {
																			ctor: '::',
																			_0: {r: 128, g: 0, b: 0},
																			_1: {
																				ctor: '::',
																				_0: {r: 128, g: 0, b: 0},
																				_1: {
																					ctor: '::',
																					_0: {r: 0, g: 0, b: 255},
																					_1: {
																						ctor: '::',
																						_0: {r: 0, g: 128, b: 0},
																						_1: {
																							ctor: '::',
																							_0: {r: 0, g: 128, b: 0},
																							_1: {
																								ctor: '::',
																								_0: {r: 0, g: 255, b: 255},
																								_1: {ctor: '[]'}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										},
										_1: {
											ctor: '::',
											_0: {
												ctor: '::',
												_0: {r: 0, g: 128, b: 128},
												_1: {
													ctor: '::',
													_0: {r: 0, g: 128, b: 0},
													_1: {
														ctor: '::',
														_0: {r: 0, g: 128, b: 0},
														_1: {
															ctor: '::',
															_0: {r: 0, g: 128, b: 0},
															_1: {
																ctor: '::',
																_0: {r: 0, g: 128, b: 0},
																_1: {
																	ctor: '::',
																	_0: {r: 0, g: 128, b: 0},
																	_1: {
																		ctor: '::',
																		_0: {r: 0, g: 128, b: 0},
																		_1: {
																			ctor: '::',
																			_0: {r: 0, g: 0, b: 255},
																			_1: {
																				ctor: '::',
																				_0: {r: 0, g: 128, b: 0},
																				_1: {
																					ctor: '::',
																					_0: {r: 0, g: 128, b: 0},
																					_1: {
																						ctor: '::',
																						_0: {r: 0, g: 128, b: 0},
																						_1: {
																							ctor: '::',
																							_0: {r: 0, g: 128, b: 0},
																							_1: {
																								ctor: '::',
																								_0: {r: 0, g: 128, b: 0},
																								_1: {
																									ctor: '::',
																									_0: {r: 0, g: 255, b: 255},
																									_1: {ctor: '[]'}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											},
											_1: {
												ctor: '::',
												_0: {
													ctor: '::',
													_0: {r: 0, g: 0, b: 0},
													_1: {
														ctor: '::',
														_0: {r: 0, g: 0, b: 0},
														_1: {
															ctor: '::',
															_0: {r: 0, g: 0, b: 0},
															_1: {
																ctor: '::',
																_0: {r: 0, g: 0, b: 0},
																_1: {
																	ctor: '::',
																	_0: {r: 0, g: 0, b: 0},
																	_1: {
																		ctor: '::',
																		_0: {r: 0, g: 0, b: 255},
																		_1: {
																			ctor: '::',
																			_0: {r: 0, g: 255, b: 0},
																			_1: {
																				ctor: '::',
																				_0: {r: 255, g: 0, b: 0},
																				_1: {
																					ctor: '::',
																					_0: {r: 255, g: 0, b: 0},
																					_1: {
																						ctor: '::',
																						_0: {r: 0, g: 0, b: 255},
																						_1: {
																							ctor: '::',
																							_0: {r: 0, g: 128, b: 0},
																							_1: {
																								ctor: '::',
																								_0: {r: 0, g: 128, b: 0},
																								_1: {
																									ctor: '::',
																									_0: {r: 0, g: 128, b: 0},
																									_1: {
																										ctor: '::',
																										_0: {r: 0, g: 255, b: 255},
																										_1: {ctor: '[]'}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												},
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};

var _minond$brainloller$Elem$textCopy = function (copy) {
	var pClasses = {
		ctor: '::',
		_0: _justgage$tachyons_elm$Tachyons_Classes$lh_copy,
		_1: {
			ctor: '::',
			_0: _justgage$tachyons_elm$Tachyons_Classes$helvetica,
			_1: {ctor: '[]'}
		}
	};
	return A2(
		_elm_lang$html$Html$p,
		{
			ctor: '::',
			_0: _justgage$tachyons_elm$Tachyons$classes(pClasses),
			_1: {ctor: '[]'}
		},
		copy);
};
var _minond$brainloller$Elem$mainTitle = function (title) {
	var h1Classes = {
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
	};
	return A2(
		_elm_lang$html$Html$h1,
		{
			ctor: '::',
			_0: _justgage$tachyons_elm$Tachyons$classes(h1Classes),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(title),
			_1: {ctor: '[]'}
		});
};
var _minond$brainloller$Elem$stylesheet = function (url) {
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
var _minond$brainloller$Elem$cmdContentBtn = F4(
	function (name, imgSrc, attrs, content) {
		return A2(
			_elm_lang$html$Html$label,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$title(name),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$tabindex(1),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('cmd-btn'),
						_1: attrs
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$img,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$src(imgSrc),
						_1: {ctor: '[]'}
					},
					content),
				_1: {ctor: '[]'}
			});
	});
var _minond$brainloller$Elem$cmdBtn = F3(
	function (label, imgSrc, attrs) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$title(label),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$tabindex(1),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('cmd-btn'),
						_1: attrs
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$img,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$src(imgSrc),
						_1: {ctor: '[]'}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _minond$brainloller$Elem$link = F3(
	function (label, to, external) {
		return A2(
			_elm_lang$html$Html$a,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$href(to),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$target(
						A3(_minond$brainloller$Util$ternary, external, '_blank', '_self')),
					_1: {
						ctor: '::',
						_0: _justgage$tachyons_elm$Tachyons$classes(
							{
								ctor: '::',
								_0: _justgage$tachyons_elm$Tachyons_Classes$link,
								_1: {
									ctor: '::',
									_0: _justgage$tachyons_elm$Tachyons_Classes$dim,
									_1: {
										ctor: '::',
										_0: _justgage$tachyons_elm$Tachyons_Classes$blue,
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(label),
				_1: {ctor: '[]'}
			});
	});

var _minond$brainloller$Ports$uploadFile = _elm_lang$core$Native_Platform.outgoingPort(
	'uploadFile',
	function (v) {
		return v;
	});
var _minond$brainloller$Ports$imageProcessed = _elm_lang$core$Native_Platform.incomingPort(
	'imageProcessed',
	_elm_lang$core$Json_Decode$list(
		_elm_lang$core$Json_Decode$list(
			A2(
				_elm_lang$core$Json_Decode$andThen,
				function (r) {
					return A2(
						_elm_lang$core$Json_Decode$andThen,
						function (g) {
							return A2(
								_elm_lang$core$Json_Decode$andThen,
								function (b) {
									return _elm_lang$core$Json_Decode$succeed(
										{r: r, g: g, b: b});
								},
								A2(_elm_lang$core$Json_Decode$field, 'b', _elm_lang$core$Json_Decode$int));
						},
						A2(_elm_lang$core$Json_Decode$field, 'g', _elm_lang$core$Json_Decode$int));
				},
				A2(_elm_lang$core$Json_Decode$field, 'r', _elm_lang$core$Json_Decode$int)))));

var _minond$brainloller$Main$introText = {
	ctor: '::',
	_0: _minond$brainloller$Elem$textCopy(
		{
			ctor: '::',
			_0: A3(_minond$brainloller$Elem$link, 'Brainloller', 'https://esolangs.org/wiki/Brainloller', true),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html$text(' is '),
				_1: {
					ctor: '::',
					_0: A3(_minond$brainloller$Elem$link, 'Brainfuck', 'http://minond.xyz/brainfuck', false),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html$text(' but represented as an image. In Brainfuck you start\n            with a tape of cells ranging from 0 to, in this case,\n            '),
						_1: {
							ctor: '::',
							_0: A3(_minond$brainloller$Elem$link, 'infinity', 'https://en.wikipedia.org/wiki/Infinity', true),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html$text(' or as much as your browser can store. This is your\n            program\'s memory. Memory is manipulated using commands that let\n            increment and decrement the value of the current cell and that\n            let you shift the active cell to the left or to the right. In\n            addition to the cell manipulating commands you have a loop\n            construct (a command for starting a loop and a separate one for\n            ending it) and input and output commands.\n            '),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		}),
	_1: {
		ctor: '::',
		_0: _minond$brainloller$Elem$textCopy(
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text('This gives you a total of 8 commands that leave you with a '),
				_1: {
					ctor: '::',
					_0: A3(_minond$brainloller$Elem$link, 'turing complete', 'https://en.wikipedia.org/wiki/Turing_completeness', true),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html$text(' language, what ever that actually means in practice, but\n            in theory it means you can program anything. Given that\n            Brainloller code is store in a two dimensional image, the\n            language provides two additional commands for rotating the\n            instruction pointer direction.\n            '),
						_1: {ctor: '[]'}
					}
				}
			}),
		_1: {ctor: '[]'}
	}
};
var _minond$brainloller$Main$historyForw = function (hist) {
	var _p0 = hist;
	switch (_p0.ctor) {
		case 'Curr':
			return {ctor: '[]'};
		case 'BackCurr':
			return {ctor: '[]'};
		default:
			return _p0._2;
	}
};
var _minond$brainloller$Main$historyBack = function (hist) {
	var _p1 = hist;
	switch (_p1.ctor) {
		case 'Curr':
			return {ctor: '[]'};
		case 'BackCurr':
			return _p1._0;
		default:
			return _p1._0;
	}
};
var _minond$brainloller$Main$historyCurr = function (hist) {
	var _p2 = hist;
	switch (_p2.ctor) {
		case 'Curr':
			return _p2._0;
		case 'BackCurr':
			return _p2._1;
		default:
			return _p2._1;
	}
};
var _minond$brainloller$Main$Model = F5(
	function (a, b, c, d, e) {
		return {work: a, activeCmd: b, boardDimensions: c, zoomLevel: d, writeEnabled: e};
	});
var _minond$brainloller$Main$Reset = {ctor: 'Reset'};
var _minond$brainloller$Main$ZoomOut = {ctor: 'ZoomOut'};
var _minond$brainloller$Main$ZoomIn = {ctor: 'ZoomIn'};
var _minond$brainloller$Main$Redo = {ctor: 'Redo'};
var _minond$brainloller$Main$Undo = {ctor: 'Undo'};
var _minond$brainloller$Main$ImageProcessed = function (a) {
	return {ctor: 'ImageProcessed', _0: a};
};
var _minond$brainloller$Main$subscriptions = function (model) {
	return _minond$brainloller$Ports$imageProcessed(_minond$brainloller$Main$ImageProcessed);
};
var _minond$brainloller$Main$UploadFile = {ctor: 'UploadFile'};
var _minond$brainloller$Main$DecreaseSize = {ctor: 'DecreaseSize'};
var _minond$brainloller$Main$IncreaseSize = {ctor: 'IncreaseSize'};
var _minond$brainloller$Main$DisableWrite = {ctor: 'DisableWrite'};
var _minond$brainloller$Main$EnableWrite = {ctor: 'EnableWrite'};
var _minond$brainloller$Main$WriteCmd = F3(
	function (a, b, c) {
		return {ctor: 'WriteCmd', _0: a, _1: b, _2: c};
	});
var _minond$brainloller$Main$programOutput = function (model) {
	var write = F3(
		function (x, y, f) {
			return A3(_minond$brainloller$Main$WriteCmd, x, y, f);
		});
	var program = _minond$brainloller$Main$historyCurr(model.work);
	var dim = _minond$brainloller$Brainloller_Pixel$programDimensions(program);
	var width = 2 + A2(
		_elm_lang$core$Basics$max,
		_elm_lang$core$Tuple$first(dim),
		_elm_lang$core$Tuple$first(model.boardDimensions));
	var height = 2 + A2(
		_elm_lang$core$Basics$max,
		_elm_lang$core$Tuple$second(dim),
		_elm_lang$core$Tuple$second(model.boardDimensions));
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('program-cells'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'zoom',
								_1: _elm_lang$core$Basics$toString(model.zoomLevel)
							},
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A6(_minond$brainloller$Brainloller_Pixel$programCells, width, height, program, write, _minond$brainloller$Main$EnableWrite, _minond$brainloller$Main$DisableWrite),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		});
};
var _minond$brainloller$Main$SetCmd = function (a) {
	return {ctor: 'SetCmd', _0: a};
};
var _minond$brainloller$Main$programCommands = function (model) {
	var activeCmd = A2(_elm_lang$core$Maybe$withDefault, '', model.activeCmd);
	var setCmd = function (cmd) {
		return _minond$brainloller$Main$SetCmd(cmd);
	};
	return A2(_minond$brainloller$Brainloller_Pixel$commandsForm, setCmd, activeCmd);
};
var _minond$brainloller$Main$NoOp = {ctor: 'NoOp'};
var _minond$brainloller$Main$programContainer = function (model) {
	var resetBtn = A3(
		_minond$brainloller$Elem$cmdBtn,
		'Clear',
		'assets/images/blank.png',
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onClick(_minond$brainloller$Main$Reset),
			_1: {ctor: '[]'}
		});
	var zoomOutBtn = A3(
		_minond$brainloller$Elem$cmdBtn,
		'Zoom out',
		'assets/images/zoomout.png',
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onClick(_minond$brainloller$Main$ZoomOut),
			_1: {ctor: '[]'}
		});
	var zoomInBtn = A3(
		_minond$brainloller$Elem$cmdBtn,
		'Zoom in',
		'assets/images/zoomin.png',
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onClick(_minond$brainloller$Main$ZoomIn),
			_1: {ctor: '[]'}
		});
	var shrinkBtn = A3(
		_minond$brainloller$Elem$cmdBtn,
		'Contract canvas',
		'assets/images/contract.png',
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onClick(_minond$brainloller$Main$DecreaseSize),
			_1: {ctor: '[]'}
		});
	var growBtn = A3(
		_minond$brainloller$Elem$cmdBtn,
		'Expand canvas',
		'assets/images/expand.png',
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onClick(_minond$brainloller$Main$IncreaseSize),
			_1: {ctor: '[]'}
		});
	var redoBtn = A3(
		_minond$brainloller$Elem$cmdBtn,
		'Redo',
		'assets/images/redo.png',
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onClick(_minond$brainloller$Main$Redo),
			_1: {ctor: '[]'}
		});
	var undoBtn = A3(
		_minond$brainloller$Elem$cmdBtn,
		'Undo',
		'assets/images/undo.png',
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onClick(_minond$brainloller$Main$Undo),
			_1: {ctor: '[]'}
		});
	var pauseBtn = A3(
		_minond$brainloller$Elem$cmdBtn,
		'Pause',
		'assets/images/pause.png',
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onClick(_minond$brainloller$Main$NoOp),
			_1: {ctor: '[]'}
		});
	var playBtn = A3(
		_minond$brainloller$Elem$cmdBtn,
		'Play',
		'assets/images/play.png',
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onClick(_minond$brainloller$Main$NoOp),
			_1: {ctor: '[]'}
		});
	var downloadBtn = A3(
		_minond$brainloller$Elem$cmdBtn,
		'Download',
		'assets/images/download.png',
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onClick(_minond$brainloller$Main$NoOp),
			_1: {ctor: '[]'}
		});
	var uploadBtn = A4(
		_minond$brainloller$Elem$cmdContentBtn,
		'Upload',
		'assets/images/upload.png',
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onClick(_minond$brainloller$Main$NoOp),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$input,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$type_('file'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$id('fileupload'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('dn'),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html_Events$on,
									'change',
									_elm_lang$core$Json_Decode$succeed(_minond$brainloller$Main$UploadFile)),
								_1: {ctor: '[]'}
							}
						}
					}
				},
				{ctor: '[]'}),
			_1: {ctor: '[]'}
		});
	var commands = {
		ctor: '::',
		_0: playBtn,
		_1: {
			ctor: '::',
			_0: pauseBtn,
			_1: {
				ctor: '::',
				_0: undoBtn,
				_1: {
					ctor: '::',
					_0: redoBtn,
					_1: {
						ctor: '::',
						_0: growBtn,
						_1: {
							ctor: '::',
							_0: shrinkBtn,
							_1: {
								ctor: '::',
								_0: zoomInBtn,
								_1: {
									ctor: '::',
									_0: zoomOutBtn,
									_1: {
										ctor: '::',
										_0: resetBtn,
										_1: {
											ctor: '::',
											_0: uploadBtn,
											_1: {
												ctor: '::',
												_0: downloadBtn,
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	};
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{ctor: '[]'},
				A2(
					_elm_lang$core$Basics_ops['++'],
					commands,
					_minond$brainloller$Main$programCommands(model))),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _minond$brainloller$Main$programOutput(model),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _minond$brainloller$Main$view = function (model) {
	var containerClasses = {
		ctor: '::',
		_0: 'main-container',
		_1: {
			ctor: '::',
			_0: _justgage$tachyons_elm$Tachyons_Classes$cf,
			_1: {
				ctor: '::',
				_0: _justgage$tachyons_elm$Tachyons_Classes$pa3,
				_1: {
					ctor: '::',
					_0: _justgage$tachyons_elm$Tachyons_Classes$pa4_ns,
					_1: {ctor: '[]'}
				}
			}
		}
	};
	var title = _minond$brainloller$Elem$mainTitle('Brainloller');
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _justgage$tachyons_elm$Tachyons$classes(containerClasses),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: title,
			_1: {
				ctor: '::',
				_0: _minond$brainloller$Elem$textCopy(_minond$brainloller$Main$introText),
				_1: {
					ctor: '::',
					_0: _minond$brainloller$Main$programContainer(model),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _minond$brainloller$Main$BackCurrForw = F3(
	function (a, b, c) {
		return {ctor: 'BackCurrForw', _0: a, _1: b, _2: c};
	});
var _minond$brainloller$Main$BackCurr = F2(
	function (a, b) {
		return {ctor: 'BackCurr', _0: a, _1: b};
	});
var _minond$brainloller$Main$Curr = function (a) {
	return {ctor: 'Curr', _0: a};
};
var _minond$brainloller$Main$initialModel = {
	work: _minond$brainloller$Main$Curr(_minond$brainloller$Brainloller_Program$progHelloWorld),
	activeCmd: _elm_lang$core$Maybe$Nothing,
	boardDimensions: _minond$brainloller$Brainloller_Pixel$programDimensions(_minond$brainloller$Brainloller_Program$progHelloWorld),
	zoomLevel: 1,
	writeEnabled: false
};
var _minond$brainloller$Main$update = F2(
	function (message, model) {
		var _p3 = {ctor: '_Tuple3', _0: message, _1: model, _2: model.activeCmd};
		switch (_p3._0.ctor) {
			case 'NoOp':
				return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
			case 'UploadFile':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _minond$brainloller$Ports$uploadFile('#fileupload')
				};
			case 'ImageProcessed':
				var _p4 = _p3._0._0;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							work: _minond$brainloller$Main$Curr(_p4),
							zoomLevel: 1,
							boardDimensions: _minond$brainloller$Brainloller_Pixel$programDimensions(_p4)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Undo':
				var _p5 = _p3._1.work;
				switch (_p5.ctor) {
					case 'Curr':
						return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
					case 'BackCurr':
						var _p6 = _p5._0;
						var newForw = {
							ctor: '::',
							_0: _p5._1,
							_1: {ctor: '[]'}
						};
						var newBack = _minond$brainloller$Util$asList(
							_elm_lang$core$List$tail(_p6));
						var newCurr = _minond$brainloller$Util$asList(
							_elm_lang$core$List$head(_p6));
						var update = A3(_minond$brainloller$Main$BackCurrForw, newBack, newCurr, newForw);
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{work: update}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					default:
						var _p9 = _p5._2;
						var _p8 = _p5._1;
						var newForw = {ctor: '::', _0: _p8, _1: _p9};
						var update = function () {
							var _p7 = _p5._0;
							if (_p7.ctor === '[]') {
								return A3(
									_minond$brainloller$Main$BackCurrForw,
									{ctor: '[]'},
									_p8,
									_p9);
							} else {
								if (_p7._1.ctor === '[]') {
									return A3(
										_minond$brainloller$Main$BackCurrForw,
										{ctor: '[]'},
										_p7._0,
										newForw);
								} else {
									return A3(_minond$brainloller$Main$BackCurrForw, _p7._1, _p7._0, newForw);
								}
							}
						}();
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{work: update}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
				}
			case 'Redo':
				var _p10 = _p3._1.work;
				if (_p10.ctor === 'BackCurrForw') {
					var _p13 = _p10._1;
					var _p12 = _p10._0;
					var newBack = {ctor: '::', _0: _p13, _1: _p12};
					var update = function () {
						var _p11 = _p10._2;
						if (_p11.ctor === '[]') {
							return A2(_minond$brainloller$Main$BackCurr, _p12, _p13);
						} else {
							if (_p11._1.ctor === '[]') {
								return A2(_minond$brainloller$Main$BackCurr, newBack, _p11._0);
							} else {
								return A3(_minond$brainloller$Main$BackCurrForw, newBack, _p11._0, _p11._1);
							}
						}
					}();
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{work: update}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				} else {
					return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				}
			case 'WriteCmd':
				if (_p3._2.ctor === 'Just') {
					var _p17 = _p3._0._1;
					var _p16 = _p3._0._0;
					var _p15 = _p3._1.work;
					var rewrite = _p3._0._2 || _p3._1.writeEnabled;
					var pixel = A2(_minond$brainloller$Brainloller_Lang$getBlCmd, _p3._2._0, _minond$brainloller$Brainloller_Lang$blCmdPixel);
					var program = _minond$brainloller$Main$historyCurr(_p15);
					var back = {
						ctor: '::',
						_0: program,
						_1: _minond$brainloller$Main$historyBack(_p15)
					};
					var resized = rewrite ? A3(_minond$brainloller$Brainloller_Pixel$resizeProgram, program, _p16, _p17) : program;
					var update = function () {
						var _p14 = {
							ctor: '_Tuple2',
							_0: rewrite,
							_1: A3(_minond$brainloller$Brainloller_Pixel$getCellMaybe, resized, _p16, _p17)
						};
						if (((_p14.ctor === '_Tuple2') && (_p14._0 === true)) && (_p14._1.ctor === 'Just')) {
							return A2(
								_minond$brainloller$Main$BackCurr,
								back,
								A4(_minond$brainloller$Brainloller_Pixel$setCellAt, resized, _p16, _p17, pixel));
						} else {
							return _p15;
						}
					}();
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{work: update}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				} else {
					return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				}
			case 'SetCmd':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							activeCmd: _elm_lang$core$Maybe$Just(_p3._0._0)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'EnableWrite':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{writeEnabled: true}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'DisableWrite':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{writeEnabled: false}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'IncreaseSize':
				var _p18 = _p3._1.boardDimensions;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							boardDimensions: {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Tuple$first(_p18) + 1,
								_1: _elm_lang$core$Tuple$second(_p18) + 1
							}
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'DecreaseSize':
				var _p19 = _p3._1.boardDimensions;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							boardDimensions: {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Tuple$first(_p19) - 1,
								_1: _elm_lang$core$Tuple$second(_p19) - 1
							}
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'ZoomIn':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{zoomLevel: _p3._1.zoomLevel + 0.1}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'ZoomOut':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{zoomLevel: _p3._1.zoomLevel - 0.1}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			default:
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							work: _minond$brainloller$Main$Curr(
								{ctor: '[]'})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
		}
	});
var _minond$brainloller$Main$main = _elm_lang$html$Html$program(
	{
		init: {ctor: '_Tuple2', _0: _minond$brainloller$Main$initialModel, _1: _elm_lang$core$Platform_Cmd$none},
		view: _minond$brainloller$Main$view,
		update: _minond$brainloller$Main$update,
		subscriptions: _minond$brainloller$Main$subscriptions
	})();

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _minond$brainloller$Main$main !== 'undefined') {
    _minond$brainloller$Main$main(Elm['Main'], 'Main', {"types":{"unions":{"Main.Msg":{"args":[],"tags":{"Redo":[],"WriteCmd":["Int","Int","Bool"],"DecreaseSize":[],"ImageProcessed":["Brainloller.Lang.BLProgram"],"ZoomIn":[],"ZoomOut":[],"EnableWrite":[],"UploadFile":[],"Reset":[],"Undo":[],"SetCmd":["Brainloller.Lang.BLOptCode"],"NoOp":[],"DisableWrite":[],"IncreaseSize":[]}}},"aliases":{"Brainloller.Lang.BLProgram":{"args":[],"type":"List (List Brainloller.Lang.Pixel)"},"Brainloller.Lang.Pixel":{"args":[],"type":"{ r : Int, g : Int, b : Int }"},"Brainloller.Lang.BLOptCode":{"args":[],"type":"String"}},"message":"Main.Msg"},"versions":{"elm":"0.18.0"}});
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

