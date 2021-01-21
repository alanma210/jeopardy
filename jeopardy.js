// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

function shuffle(array) {
	let counter = array.length;
	// While there are elements in the array
	while (counter > 0) {
		// Pick a random index
		let index = Math.floor(Math.random() * counter);
		// Decrease counter by 1
		counter--;
		// And swap the last element with it
		let temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	}
	return array;
}

const startBtn = document.getElementById('start');
startBtn.addEventListener('click', function (e) {
	console.log('Party!');
	// console.log(categories.length);
	if (categories.length !== 0) {
		restart();
	} else {
		startBtn.innerText = 'Restart!';
		showLoadingView();
		fillTable();
	}
});

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 * Category: https://jservice.io/api/categories/?count=100
 * Random: https://jservice.io/api/random/?count=100
 */

async function getCategoryIds() {
	let cat_ids = [];
	const url = `https://jservice.io/api/random/?count=100`;
	const res = await axios.get(url);
	// console.log(res);
	let numResults = res.data.length;
	if (numResults) {
		let clues = res.data;
		// console.log(clues);
		for (let clue of clues) {
			cat_ids.push(clue.category.id);
		}
	}
	const uniqueCats = [...new Set(cat_ids)];
	cat_ids = shuffle(uniqueCats);
	cat_ids = cat_ids.slice(0, 6);
	// console.log(cat_ids);
	return cat_ids;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 * Request: https://jservice.io/api/category/?id=5130
 */

async function getCategory(catId) {
	const cat = {};
	const url = `https://jservice.io/api/category/?id=${catId}`;
	const res = await axios.get(url);
	cat.title = res.data.title; // assign title to cat object
	cat.catId = catId;
	let clues = res.data.clues; // extract array of clues
	clues = shuffle(clues);
	// console.log(clues);
	const clueArray = [];
	let clueObj = {}; // create clue objects

	for (let clue of clues) {
		clueObj = {
			id: clue.id,
			question: clue.question,
			answer: clue.answer,
			showing: 'null'
		};
		// console.log(clueObj);
		clueArray.push(clueObj); // attach clue objects to clueArray
	}
	cat.clues = clueArray; // attach clueArray to cat object
	// console.log(cat);
	return cat;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
	const cat_ids = await getCategoryIds(); // return 6 random cat_ids
	// console.log(cat_ids);
	for (let cat_id of cat_ids) {
		const cats = await getCategory(cat_id);
		categories.push(cats);
	}
	console.log(categories);

	const table = document.querySelector('#jeopardy');
	const tHeader = document.createElement('thead');
	const topRow = document.createElement('tr');
	const tBody = document.createElement('tbody');
	tBody.addEventListener('click', handleClick);
	for (let cat_id of cat_ids) {
		const headCell = document.createElement('td');
		const cats = await getCategory(cat_id);
		headCell.setAttribute('id', cat_id);
		headCell.innerText = cats.title.toUpperCase();
		topRow.append(headCell);
	}
	tHeader.append(topRow);
	table.append(tHeader);

	for (let i = 0; i < 6; i++) {
		const headCell = document.createElement('td');

		for (let j = 0; j < 5; j++) {
			const bodyCell = document.createElement('tr');
			// console.log(categories[i].clues[j].id);
			bodyCell.setAttribute('id', i + '-' + j);
			bodyCell.className = 'clues';
			bodyCell.innerText = '?';
			headCell.append(bodyCell);
			tBody.append(headCell);
		}
	}
	table.append(tBody);
}

// fillTable();

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(e) {
	const target = e.target.id;
	// console.log(target);
	const targetCell = document.getElementById(target);
	// console.log(targetCell);
	const x = target.substr(0, 1);
	const y = target.substr(2, 1);
	const cat = categories[x].title;
	// console.log(cat);
	const clue = categories[x].clues[y];
	// console.log(clue);
	// console.log(clue.question);

	// let answer = clue.answer;
	// console.log(answer);
	// if (answer.substr(0, 1) === '<') {
	// 	answer = answer.substing(2, answer.length - 4);
	// }
	if (clue.showing === 'null') {
		clue.showing = 'question';
		targetCell.innerText = clue.question;
	} else if (clue.showing === 'question') {
		clue.showing = 'answer';
		targetCell.innerText = clue.answer;
	} else {
	}
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
	const loader = document.getElementById('loader');
	loader.className = 'loading';
	startBtn.innerText = 'loading...';
	const timeId = setTimeout(hideLoadingView, 3500);
}

function restart() {
	console.log('Reloading..');
	showLoadingView();
	categories.length = 0;
	const table = document.getElementById('jeopardy');
	table.removeChild(table.childNodes[1]);
	table.removeChild(table.childNodes[1]);
	fillTable();
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
	const loader = document.getElementById('loader');
	loader.className = 'loaded';
	startBtn.innerText = 'Restart!';
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {}

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO

// Questions:
// How to get rid of the <i> tags in the answers?
// How to make the loader work better (wait for the page to load then disappear)?
// How to vertical align middle the clues and answer?
