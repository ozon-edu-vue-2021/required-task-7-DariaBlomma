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

const allFriendsArr = [];
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

// * загружает данные, рендерит список контактов, находит и  рендерит топ 3 друзей
const initFriendsApp = async () => {
    await fetchData();
    data.forEach(item => {
        renderPersonName(contactsList, item.name, item.id, item.friends);

        allFriendsArr.push(item.friends[0], item.friends[1], item.friends[2]);
    })

    findTop3Friends();
};


const findTop3Friends = () => {
    let allFriendsCounted = [];
    const top3ForSort = [];;

    const repeatedFriendsNumber = allFriendsArr.reduce((acc, rec, index) => {
        // * acc[rec] = rec - число в массиве
        // * { 10: 1} - число массива, его кол-во вхождений
        // * typeof acc[rec] === 'undefined' когда число встречается первый раз и acc[rec] еще не был записан
        // * если было пусто, ставим кол-во 1, если уже было - увеличим
        return (typeof acc[rec] !== 'undefined') 
          ? { ...acc, [rec]: acc[rec] + 1 } 
          : { ...acc, [rec]: 1 };
    }, {});

    for (const [key, value] of Object.entries(repeatedFriendsNumber)) { 
        allFriendsCounted.push({ key, value });
    }

    // * сортируем повторяющиеся элементы по числу повторений
    allFriendsCounted.sort((prev, next) => next.value - prev.value);
    // * выбираем первичный топ 3
    const top3Friends = allFriendsCounted.splice(0, 3);

    // * найдем повторяющиеся внутри топ 3
    top3Friends.forEach((item, index) => {
        if (top3Friends[index + 1]) {
            if (item.value === top3Friends[index + 1].value) {
                top3ForSort.push(item);
                top3ForSort.push(top3Friends[index + 1]);
            }
        }
    });

    // * найдем повторяющиеся из топ 3 и общем массиве друзей с количестовом. 
    // * это может быть, если : 
    // * 1. Все 3 топ 3 одинаковые
    // * 2. Последний эл-т из топ 3 повторяется в общем массиве allFriendsCounted
    const repeatedTopFriends = allFriendsCounted.filter(item => item.value === top3Friends[2].value)

    // * соединим повторяющиеся в один массив
    repeatedTopFriends.forEach(item => {
        top3ForSort.push(item);
    });

    // * добавляем имена к топу повторяющихся
    let repeatedTopFriendsWithNames = top3ForSort.map(item => {
        const person = data.find(elem => elem.id === parseInt(item.key));
        return {
            ...item,
            name: person.name,
        }

        ;
    });

    // * сортируем повторяющиеся по имени и кол-ву повторений
    repeatedTopFriendsWithNames.sort((prev, next) => {
        if ( (prev.name < next.name) && (prev.value < next.value )) return -1;
        if ( (prev.name > next.name) && (prev.value > next.value )) return 1;
    });


    const top3 = repeatedTopFriendsWithNames.splice(0, 3);
    // * рендерим
    top3.forEach((item, index) => {
        isPopulars[index].innerText = item.name
    });
};

// * обработчик событий клика на открытие и закрытие нужного списка
const togglePersonCard = () => {
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

initFriendsApp();

togglePersonCard();

// * находит и рендерит друзей и не друзей
const findFriends = (friends) => {
    const notFriendsList = [];
    const friendsNumbers = friends.split(',');;
    data.forEach(item => {
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