"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transection = exports.Book = exports.User = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const dburl = process.env.DB_URL;
mongoose_1.default.connect(dburl).then(() => {
    console.log("mongodb connected");
}).catch((e) => {
    console.log(e);
});
;
const UserSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    mobileno: String
});
;
const BookSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    Category: {
        type: String,
        required: true
    },
    rendperday: Number
});
const TransectionSchema = new mongoose_1.default.Schema({
    bookid: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    userid: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    issuedate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    returndate: {
        type: Date,
        required: false
    }
});
exports.User = mongoose_1.default.model("User", UserSchema);
exports.Book = mongoose_1.default.model("Book", BookSchema);
exports.Transection = mongoose_1.default.model("Transection", TransectionSchema);
