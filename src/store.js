import {
    writable
} from "svelte/store";

export let jData = writable({
    _id: 1,
    firstName: "Mathilde",
    lastName: "Runge",
    img: "https://source.unsplash.com/random/50x59",
    status: 1,
    public_json: {
        _id: 1,
        firstName: "Mathilde",
        lastName: "Runge",
        img: "https://source.unsplash.com/random/50x59",
        status: 1,
    },
    posts: [{
        _id: 1,
        body: "Post description",
        timestamp: "1590244303",
        img: "https://source.unsplash.com/random/500x509",
        user: {
            _id: 4,
            firstName: "Hannah",
            lastName: "Ølsted",
            img: "https://source.unsplash.com/random/50x63",
            status: 1,
        },
        likes: [{
            _id: 1,
            firstName: "Mathilde",
            lastName: "Runge",
            img: "https://source.unsplash.com/random/50x59",
            status: 1,
        },],
        comments: [{
            _id: 1,
            user: {
                _id: 4,
                firstName: "Hannah",
                lastName: "Ølsted",
                img: "https://source.unsplash.com/random/50x63",
                status: 0,
            },
            post_id: 1,
            body: "Comment",
            timestamp: "1590244303",
            likes: [{
                _id: 1,
                firstName: "Mathilde",
                lastName: "Runge",
                img: "https://source.unsplash.com/random/50x59",
                status: 1,
            },],
        }],
    },
    {
        _id: 2,
        body: "Post description 2",
        timestamp: "1590244303",
        img: "https://source.unsplash.com/random/500x510",
        user: {
            _id: 3,
            firstName: "Christian",
            lastName: "Tønsberg",
            img: "https://source.unsplash.com/random/50x62",
            status: 1,
        },
        likes: [{
            _id: 1,
            firstName: "Mathilde",
            lastName: "Runge",
            img: "https://source.unsplash.com/random/50x59",
            status: 1,
        },],
        comments: [{
            _id: 1,
            user: {
                _id: 4,
                firstName: "Hannah",
                lastName: "Ølsted",
                img: "https://source.unsplash.com/random/50x63",
                status: 0,
            },
            post_id: 1,
            body: "Comment",
            timestamp: "1590244303",
            likes: [{
                _id: 1,
                firstName: "Mathilde",
                lastName: "Runge",
                img: "https://source.unsplash.com/random/50x59",
                status: 1,
            },]
        }],
    },
    ],
    contacts: [{
        _id: 5,
        firstName: "Sophie",
        lastName: "Holmboe",
        img: "https://source.unsplash.com/random/50x60",
        status: 0,
    },
    {
        _id: 2,
        firstName: "Cecilie",
        lastName: "Vilsfort",
        img: "https://source.unsplash.com/random/50x61",
        status: 1,
    },
    {
        _id: 3,
        firstName: "Christian",
        lastName: "Tønsberg",
        img: "https://source.unsplash.com/random/50x62",
        status: 1,
    },
    {
        _id: 4,
        firstName: "Hannah",
        lastName: "Ølsted",
        img: "https://source.unsplash.com/random/50x63",
        status: 1,
    },
    ],
    chats: [],
});

export let posts = writable([]);
export let isAuthorised = writable({ auth: localStorage.auth, token: localStorage.token });
export let profile = writable({});
export let contactsPosts = writable([]);
export let feedPosts = writable([]);
export let contacts = writable([]);
export let users = writable([]);

export let postModal = writable({
    show: false,
    postData: undefined,
});

// try to implement that when you press a contact it add it as an element of [chats]