'use strict';
const contactsList = document.querySelector('.contacts-list');
const detailsView = document.querySelector('.details-view');
const back = document.querySelector('.back');
const background = document.querySelector('.background');
const chosenName = document.querySelector('.chosen-person-name-text');
const friendsElem = document.querySelector('.friends');
const notFiendsElem = document.querySelector('.not-friends');
const popularPeopleElem = document.querySelector('.popular-people');
const isFriends = document.querySelectorAll('.is-friend');
const isNotFriends = document.querySelectorAll('.is-not-friend');
const isPopulars = document.querySelectorAll('.is-popular');

let allFriendsArr = [];
let allFriendsCounted = [];
let top3Friends = [];
let data = [];

const renderPersonName = (parent, name, id, friends) => {
    const li = document.createElement('li');
    li.className = 'person-name';
    li.dataset.id = id;
    li.dataset.friends = friends
    li.innerHTML = `
        <strong>${name}</strong>
    `;
    parent.append(li);
};

const fetchData = async () => {
    try {
        const res = await fetch('data.json');
        data = await res.json();
    } catch (e) {
        console.warn('Could not fetch data', e);
    }
};

const renderPeopleList = async () => {
    await fetchData();
    data.forEach(item => {
        renderPersonName(contactsList, item.name, item.id, item.friends);
        allFriendsArr.push(item.friends[0], item.friends[1], item.friends[2]);
    })
    console.log('allFriendsArr: ',  allFriendsArr);
    const result = allFriendsArr.reduce((acc, rec, index) => {
        // * acc[rec] = rec - число в массиве
        // * { 10: 1} - число массива, его кол-во вхождений
        // * typeof acc[rec] === 'undefined' когда число встречается первый раз и acc[rec] еще не был записан
        // * если было пусто, ставим кол-во 1, если уже было - увеличим
        return (typeof acc[rec] !== 'undefined') 
          ? { ...acc, [rec]: acc[rec] + 1 } 
          : { ...acc, [rec]: 1 };
    }, {});

    for (const [key, value] of Object.entries(result)) { 
        allFriendsCounted.push({ key, value });
    }
    console.log('result: ', result);
    allFriendsCounted.sort((prev, next) => next.value - prev.value);
    allFriendsCounted.forEach((item, index) => {

    })
    console.log('allFriendsCounted: ', allFriendsCounted);
};

renderPeopleList();

const openPersonCard = () => {
    document.addEventListener('click', ({ target }) => {
        const li = target.closest('.person-name');
        if (li) {
            const name = li.innerText;
            detailsView.classList.add('opened');
            back.classList.add('shown');
            chosenName.innerText = name;
            findFriends(li.dataset.friends);
        } else if (target.matches('body') || target.closest('.back')) {
            detailsView.classList.remove('opened');
            back.classList.remove('shown');
        }
    });
};
openPersonCard();


const findFriends = (friends) => {
    const notFriendsList = [];
    const friendsNumbers = friends.split(',');
    console.log('friends: ', friendsNumbers);
    data.forEach((item, outerIndex) => {
        let isFriend = 0;
        friendsNumbers.forEach((number, index) => {
            if (item.id === parseInt(number)) {
                isFriends[index].innerText = item.name;
                isFriend++;
            }

            if (index === friendsNumbers.length - 1 && !isFriend) {
                if (notFriendsList.length < 3) {
                    notFriendsList.push(item);
                }

                if (notFriendsList.length === 3) {
                    notFriendsList.forEach((item, index) => {
                        isNotFriends[index].innerText = item.name
                    });
                }  
            }
        });
    })
};

// const countTopFriends = async () => {
   

// countTopFriends();