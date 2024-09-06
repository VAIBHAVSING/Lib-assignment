"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./DB/index");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const zod_1 = __importDefault(require("zod"));
const dotenv_1 = __importDefault(require("dotenv"));
const PORT = process.env.PORT || 3000;
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
    22;
});
const BookNameSchema = zod_1.default.object({
    bookname: zod_1.default.string().min(1, "Book name is required"),
});
app.get('./book', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const book = yield index_1.Book.find();
        if (book) {
            return res.json(book);
        }
        else {
            return res.status(404).json({ message: "No books found" });
        }
    }
    catch (e) {
        return res.status(500).json({ message: "Internal server error" });
    }
}));
app.get("/book/getbyname", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookname } = req.query;
        console.log(bookname);
        // Validate query parameter using Zod
        const validationResult = BookNameSchema.safeParse({ bookname });
        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.error.errors[0].message });
        }
        const book = yield index_1.Book.findOne({ name: bookname });
        if (book) {
            return res.status(200).json({ book });
        }
        else {
            return res.status(404).json({ error: "Book not found" });
        }
    }
    catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error });
    }
}));
const pricerangeschema = zod_1.default.object({
    minRent: zod_1.default.number().optional(),
    maxRent: zod_1.default.number().optional(),
});
app.get("/book/pricerange", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { minRent, maxRent } = req.query;
        const validationResult = pricerangeschema.safeParse({ minRent, maxRent });
        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.error.errors[0].message });
        }
        const book = yield index_1.Book.find({
            rendperday: {
                $gte: minRent, $lte: maxRent
            }
        });
        if (book) {
            return res.json(book);
        }
        else {
            return res.status(404).json({ message: "No books found" });
        }
    }
    catch (e) {
        return res.status(500).json({ message: "Internal server error" });
    }
}));
const InrangeSchema = zod_1.default.object({
    category: zod_1.default.string().optional(),
    name: zod_1.default.string().optional(),
    minRent: zod_1.default.number().optional(),
    maxRent: zod_1.default.number().optional(),
});
app.get("./book/inrange", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, name, minRent, maxRent } = req.params;
        const validationResult = InrangeSchema.safeParse({ category, name, minRent, maxRent });
        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.error.errors[0].message });
        }
        const book = yield index_1.Book.find({
            Category: category,
            name: name,
            rendperday: {
                $gte: minRent,
                $lte: maxRent
            }
        });
        if (book) {
            return res.json(book);
        }
        else {
            return res.status(404).json({ message: "No books found" });
        }
    }
    catch (e) {
        return res.status(500).json({ message: "Internal server error" });
    }
}));
app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});
