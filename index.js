/*
walk - variable that counts the number of pixels iof a scroll,
if walk more than 160(half of block) than page scrolling takes place
I make slider by changing the margin-left of my first-block element,his base margin-left = 10px
length - the number of all my blocks
reloading elements happens when page = lastPage - 1 (lastPage = length/blocksOnPage)
*/
/* eslint-disable no-eval */
const key = 'AIzaSyDAYFmyHjDVuRkqSs440g2YONo_QsddDws';
const url = 'https://www.googleapis.com/youtube/v3/search?key=';
const tail = '&type=video&part=snippet&maxResults=15';
let nextToken = '';
let page = 1;
let blocksOnPage = Math.floor(window.innerWidth / 340);
let walk = 0;

function beautyNumber(num) {
  if (num >= 1000000) return `${Math.floor(num / 1000000)}m`;
  if (num >= 1000) return `${Math.floor(num / 1000)}k`;
  return num;
}

function createElem(element) {
  const { videoId } = element.id;
  const videoName = element.snippet.title;
  const videoImg = element.snippet.thumbnails.medium.url;
  const videoAuthor = element.snippet.channelTitle;
  const videoDate = element.snippet.publishedAt;
  const videoDescr = element.snippet.description;
  const item = document.createElement('div');
  item.className = 'block';
  const img = document.createElement('img');

  img.src = videoImg;
  img.width = '320';
  img.height = '180';
  img.draggable = 'false';
  item.appendChild(img);

  const name = document.createElement('div');
  name.className = 'videoName';
  const videoLink = document.createElement('a');
  videoLink.innerHTML = videoName;
  videoLink.href = `https://www.youtube.com/watch?v=${videoId}`;
  videoLink.title = videoName;
  videoLink.target = '_blank';
  name.appendChild(videoLink);
  item.appendChild(name);

  const author = document.createElement('div');
  author.className = 'author';
  const authorIcon = document.createElement('div');
  authorIcon.className = 'icon-author';
  const authorText = document.createElement('span');
  authorText.innerHTML = videoAuthor;
  author.appendChild(authorIcon);
  author.appendChild(authorText);
  item.appendChild(author);

  const time = document.createElement('div');
  time.className = 'date';
  const timeIcon = document.createElement('div');
  timeIcon.className = 'icon-time';
  const timeText = document.createElement('span');
  timeText.innerHTML = videoDate.slice(0, 10);
  time.appendChild(timeIcon);
  time.appendChild(timeText);
  item.appendChild(time);


  const statistic = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${key}&part=snippet,contentDetails,statistics,status`;
  fetch(statistic).then((response) => {
    response.json().then((data) => {
      const views = document.createElement('div');
      views.className = 'views';
      const viewIcon = document.createElement('div');
      viewIcon.className = 'icon-eye';
      const viewCount = document.createElement('span');
      viewCount.innerHTML = beautyNumber(data.items[0].statistics.viewCount);
      views.appendChild(viewIcon);
      views.appendChild(viewCount);
      item.appendChild(views);

      const description = document.createElement('div');
      description.className = 'icon-description description';
      description.innerHTML = videoDescr;
      item.appendChild(description);
    });
  });

  document.getElementById('container').appendChild(item);
}

function search() {
  let error = '';
  const searchText = document.getElementById('searchText').value;
  fetch(`${url}${key}${tail}&q=${searchText}&pageToken=${nextToken}`).then((response) => {
    response.json().then((answer) => {
      answer.items.forEach(element => createElem(element));
      if (answer.pageInfo.totalResults === 0) {
        error = document.createElement('div');
        error.className = 'error';
        error.innerHTML = 'Oops, incorrect request';
        document.getElementById('container').appendChild(error);
        return;
      }
      nextToken = answer.nextPageToken;
    });
  });
  document.getElementsByClassName('navigation')[0].style.display = 'flex';
}

function changePage(...args) {
  let sign;
  const lastPage = Math.ceil(document.querySelectorAll('.block').length / blocksOnPage);

  if (!nextToken) return;
  if (walk !== 0) {
    if (walk > 160) {
      if (page === 1) {
        document.getElementsByClassName('prevPage')[0].style.display = 'none';
        document.getElementsByClassName('firstPage')[0].style.display = 'none';
        page += 1;
      } else if (page === 2) {
        document.getElementsByClassName('firstPage')[0].style.display = 'none';
      } else if (page === 3) document.getElementsByClassName('prevPage')[0].style.display = 'none';
      page -= 1;
      sign = '+';
    } else if (walk < -160) {
      if (page === lastPage) return;
      page += 1;
      sign = '-';
      document.getElementsByClassName('prevPage')[0].innerHTML = page - 1;
      document.getElementsByClassName('currentPage')[0].innerHTML = page;
      document.getElementsByClassName('nextPage')[0].innerHTML = page + 1;
      document.getElementsByClassName('firstPage')[0].style.display = 'block';
      if (page > 2) document.getElementsByClassName('prevPage')[0].style.display = 'block';
    }
  } else if (args[0].path[0].className === 'nextPage') {
    if (page === lastPage) return;
    page += 1;
    sign = '-';
    document.getElementsByClassName('prevPage')[0].innerHTML = page - 1;
    document.getElementsByClassName('firstPage')[0].style.display = 'block';
    if (page > 2) document.getElementsByClassName('prevPage')[0].style.display = 'block';
  } else if (args[0].path[0].className === 'prevPage') {
    sign = '+';
    page -= 1;
    if (page === 1) {
      document.getElementsByClassName('prevPage')[0].style.display = 'none';
      document.getElementsByClassName('firstPage')[0].style.display = 'none';
      return;
    } if (page === 2) {
      document.getElementsByClassName('prevPage')[0].style.display = 'none';
    }
    document.getElementsByClassName('prevPage')[0].innerHTML = page - 1;
    document.getElementsByClassName('currentPage')[0].innerHTML = page;
    document.getElementsByClassName('nextPage')[0].innerHTML = page + 1;
  } else if (args[0].path[0].className === 'firstPage') {
    document.querySelector('.block').style.marginLeft = `${10}px`;
    page = 1;
    document.getElementsByClassName('currentPage')[0].innerHTML = page;
    document.getElementsByClassName('nextPage')[0].innerHTML = page + 1;
    document.getElementsByClassName('prevPage')[0].style.display = 'none';
    document.getElementsByClassName('firstPage')[0].style.display = 'none';
    return;
  }

  if (page === lastPage - 1) search();
  const firstBlock = document.querySelector('.block');

  let margin = parseFloat(firstBlock.style.marginLeft);
  if (!margin) margin = 10;

  if (Math.abs(walk) < 160 && walk !== 0) {
    margin = eval(`${margin} - ${walk}`);
  } else {
    margin = eval(`${margin} ${sign} 340 * ${blocksOnPage} - ${walk}`);
  }
  if (margin > 10) {
    margin = 10;
    walk = 0;
  }
  firstBlock.style.marginLeft = `${margin}px`;

  document.getElementsByClassName('prevPage')[0].innerHTML = page - 1;
  document.getElementsByClassName('currentPage')[0].innerHTML = page;
  document.getElementsByClassName('nextPage')[0].innerHTML = page + 1;
  walk = 0;
}

function slider() {
  const mySlider = document.querySelector('.container');
  let firstBlock = document.querySelector('.block');
  let isDown = false;
  let startX;

  mySlider.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - mySlider.offsetLeft;
  });
  mySlider.addEventListener('mouseleave', () => {
    isDown = false;
    if (walk !== 0) {
      changePage();
    }
  });
  mySlider.addEventListener('mouseup', () => {
    isDown = false;
    if (walk !== 0) {
      changePage();
    }
  });
  mySlider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.pageX - mySlider.offsetLeft;
    walk = (x - startX);
    firstBlock = document.querySelector('.block');
    let margin = parseFloat(firstBlock.style.marginLeft);
    if (!margin) margin = 10;
    margin += Math.ceil(e.movementX);
    firstBlock.style.marginLeft = `${margin}px`;
  });
}

function start() {
  const input = document.createElement('div');
  input.className = 'input';
  document.body.appendChild(input);

  const searchText = document.createElement('input');
  searchText.type = 'text';
  searchText.id = 'searchText';
  searchText.name = 'searchText';
  searchText.placeholder = 'Search';
  if (blocksOnPage > 1) searchText.size = '106';
  else searchText.size = '50';
  input.appendChild(searchText);

  const searchButton = document.createElement('div');
  searchButton.className = 'button-search icon-search';
  input.appendChild(searchButton);

  let container = document.createElement('div');
  container.id = 'container';
  container.className = 'container';
  container.style.width = `${blocksOnPage * 340}px`;
  document.body.appendChild(container);
  container = slider();

  const navigation = document.createElement('div');
  navigation.className = 'navigation';

  const firstPage = document.createElement('button');
  firstPage.className = 'firstPage';
  firstPage.innerHTML = '1';
  firstPage.style.display = 'none';
  firstPage.onclick = changePage;

  const prevPage = document.createElement('button');
  prevPage.className = 'prevPage';
  prevPage.style.display = 'none';
  prevPage.onclick = changePage;

  const currentPage = document.createElement('button');
  currentPage.innerHTML = '1';
  currentPage.className = 'currentPage';
  currentPage.onclick = changePage;

  const nextPage = document.createElement('button');
  nextPage.innerHTML = '2';
  nextPage.className = 'nextPage';
  nextPage.onclick = changePage;

  navigation.appendChild(firstPage);
  navigation.appendChild(prevPage);
  navigation.appendChild(currentPage);
  navigation.appendChild(nextPage);
  document.body.appendChild(navigation);

  searchButton.onclick = function startSearch() {
    document.getElementById('container').innerHTML = '';
    firstPage.style.display = 'none';
    prevPage.style.display = 'none';
    page = 1;
    currentPage.innerHTML = '1';
    nextPage.innerHTML = '2';
    search();
  };
}start();

window.onkeydown = function keyboard(event) {
  if (event.key === 'Enter') {
    document.getElementById('container').innerHTML = '';
    page = 1;
    document.getElementsByClassName('prevPage')[0].innerHTML = page - 1;
    document.getElementsByClassName('currentPage')[0].innerHTML = page;
    document.getElementsByClassName('nextPage')[0].innerHTML = page + 1;
    document.getElementsByClassName('prevPage')[0].style.display = 'none';
    document.getElementsByClassName('firstPage')[0].style.display = 'none';
    return search();
  }
  return 0;
};


window.onresize = function resize() {
  blocksOnPage = Math.floor(window.innerWidth / 340);
  if (blocksOnPage === 1) {
    document.getElementById('searchText').size = '50';
  } else {
    document.getElementById('searchText').size = '106';
  }
  document.getElementsByClassName('container')[0].style.width = `${blocksOnPage * 340}px`;

  const elem = document.elementFromPoint(200, 87);
  const parent = elem.parentNode;
  const { length } = parent.childNodes;
  let count;
  for (count = 0; count < length; count += 1) {
    if (parent.childNodes[count] === elem) break;
  }
  count += 1;
  page = Math.ceil(count / blocksOnPage);
  document.getElementsByClassName('prevPage')[0].innerHTML = page - 1;
  document.getElementsByClassName('currentPage')[0].innerHTML = page;
  document.getElementsByClassName('nextPage')[0].innerHTML = page + 1;
  if (page === 1) {
    document.getElementsByClassName('prevPage')[0].style.display = 'none';
    document.getElementsByClassName('firstPage')[0].style.display = 'none';
  } else if (page === 2) {
    document.getElementsByClassName('prevPage')[0].style.display = 'none';
  }
};
