import { Book, Transection, User } from "./DB/index"
import express, { Request, Response } from "express"
import cors from "cors"
import z from "zod"
import dotenv from "dotenv";
const PORT = process.env.PORT as string || 3000;
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
    22
});
const BookNameSchema = z.object({
    bookname: z.string().min(1, "Book name is required"),
});
app.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await User.find();
        if (users) {
            return res.json(users);
        }
        else {
            return res.status(404).json({ message: "No Users found" });
        }
    }
    catch (e) {
        return res.status(500).json({ message: "Internal server error" });
    }
})
app.get('/books', async (req: Request, res: Response) => {
    try {
        const book = await Book.find();
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
})
app.get("/book/getbyname", async (req: Request, res: Response) => {
    try {
        const { bookname } = req.query;
        const validationResult = BookNameSchema.safeParse({ bookname });

        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.error });
        }

        const book = await Book.findOne({ name: bookname as string });

        if (book) {
            return res.status(200).json({ book });
        } else {
            return res.status(404).json({ error: "Book not found" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error });
    }
});
const pricerangeschema = z.object({
    minRent: z.number().min(0, "Minimum rent must be at least 0"),
    maxRent: z.number().optional(),
});

app.get("/book/pricerange", async (req: Request, res: Response) => {
    try {
        const minRent = Number(req.query.minRent);
        const maxRent = req.query.maxRent ? Number(req.query.maxRent) : undefined;
        const validationResult = pricerangeschema.safeParse({ minRent, maxRent });
        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.error });
        }
        const book = await Book.find({
            rentperday: {
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
})
const InrangeSchema = z.object({
    category: z.string().min(1, "Category is required"),
    name: z.string().min(1, "Name is required"),
    minRent: z.number().min(0, "Minimum rent must be a non-negative number"),
    maxRent: z.number().min(0, "Maximum rent must be a non-negative number")
});

app.get("/book/inrange", async (req: Request, res: Response) => {
    try {
        // Parse query parameters
        const { category, name, minRent, maxRent } = req.query;

        // Convert query parameters to appropriate types
        const minRentNum = Number(minRent);
        const maxRentNum = maxRent ? Number(maxRent) : undefined;

        // Validate query parameters using Zod
        const validationResult = InrangeSchema.safeParse({
            category: category as string,
            name: name as string,
            minRent: minRentNum,
            maxRent: maxRentNum
        });

        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.error });
        }
        const books = await Book.find({
            Category: category,
            name: name,
            rentperday: {
                $gte: minRentNum,
                $lte: maxRentNum || Infinity
            }
        });

        if (books.length > 0) {
            return res.json(books);
        } else {
            return res.status(404).json({ message: "No books found" });
        }
    } catch (e) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

const bookissueSchema = z.object({
    bookname: z.string().min(1, "Book name is required"),
    userid: z.string().min(1, "User ID is required"),
    issuedate: z.date().optional(),
});

app.post("/book/issue", async (req: Request, res: Response) => {
    try {
        const { bookname, userid } = req.body;
        const issuedate = new Date(req.body.issuedate);
        const validationResult = bookissueSchema.safeParse({ bookname, userid, issuedate });
        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.error });
        }
        const book = await Book.find({ name: bookname });

        if (!book[0]) {
            return res.status(404).json({ message: "Book not found" });
        }
        const bookissued = await Transection.findOne({
            bookid: book[0]._id,
            userid: userid,
            returndate: null
        })
        if (bookissued) {
            return res.status(400).json({ message: "Book is already issued" });
        }
        const Response = await Transection.create({
            bookid: book[0]._id,
            userid: userid, issueDate: issuedate
        });

        if (Response) {
            return res.json({ msg: "Book issued sucessful" });
        }
        else {
            return res.status(404).json({ message: "Book not found" });
        }
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error" });

    }
})
const bookReturnSchema = z.object({
    bookname: z.string().min(1, "Book name is required"),
    userid: z.string().min(1, "User ID is required"),
    returndate: z.date().default(new Date()),
});

app.post("/book/return", async (req: Request, res: Response) => {
    try {
        const { bookname, userid } = req.body;
        const returndate = new Date(req.body.returndate);
        const validationResult = bookReturnSchema.safeParse({ bookname, userid, returndate });
        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.error });
        }
        const book = await Book.findOne({ name: bookname });
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        const bookissued = await Transection.findOne({
            bookid: book._id,
            userid: userid,
            returndate: null
        })
        if (!bookissued) {
            return res.status(400).json({ message: "Book is already returned" });
        }
        const transaction = await Transection.findOneAndUpdate(
            { userid, bookid: book._id },
            { $set: { returndate } },
            { new: true }
        ).select("issuedate");

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        const issuedate = transaction.issuedate;
        const days = Math.ceil((new Date(returndate).getTime() - issuedate.getTime()) / (1000 * 60 * 60 * 24));
        const rentperday = book.rentperday as number;
        const rent = days * rentperday as number;

        return res.json({ message: "Book returned successfully", rent });
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});
app.get("/book/issuance-status", async (req: Request, res: Response) => {
    try {
        const { bookname } = req.query;
        const book = await Book.findOne({ name: bookname });
        console.log(bookname)
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        const currentTransaction = await Transection.findOne({
            bookid: book._id,
            returndate: { $exists: false } 
        }).populate('userid');

        const totalIssuedCount = await Transection.countDocuments({
            bookid: book._id
        });

        if (currentTransaction) {
            return res.json({
                totalCount: totalIssuedCount,
                currentlyIssuedTo: {
                    userid: currentTransaction._id,
                    issuedate: currentTransaction.issuedate
                },
                status: 'currentlyIssued'
            });
        } else {
            return res.json({
                totalCount: totalIssuedCount,
                currentlyIssuedTo: null,
                status: 'notIssued'
            });
        }

    }
    catch(e){
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
})
app.get('/book/total-rent', async (req: Request, res: Response) => {
    try {
        const { bookname } = req.query;

        if (typeof bookname !== 'string' || bookname.trim() === '') {
            return res.status(400).json({ error: 'Book name is required' });
        }
        const book = await Book.findOne({ name: bookname });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        const transactions = await Transection.find({
            bookid: book._id,
            returndate: { $ne: null }
        });
        let totalRent = 0;
        transactions.forEach(transaction => {
            const { issuedate, returndate } = transaction;
            const days = Math.ceil((new Date(returndate).getTime() - new Date(issuedate).getTime()) / (1000 * 60 * 60 * 24));
            const rentPerDay = book.rentperday as number;
            totalRent += days * rentPerDay;
        });

        return res.json({ totalRent });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
const UserNameSchema=z.object({
    userid: z.string().min(1).max(50)
})
app.get("/book/issuedbyuser",async (req: Request, res: Response)=>{
    try{
        const {userid} = req.query;
        const validationResult = UserNameSchema.safeParse({userid });

        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.error });
        }
        const user = await User.findOne({ _id: userid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
            }
            const transactions = await Transection.find({
                userid: user._id,
            });
            
            if(transactions){
                return res.json(transactions);
            }
            else{
                return res.status(411).json({msg:"User havent issue any book"})
            }

    }
    catch(e){
        console.error(e);
        return res.status(500).json({ message: 'Internal server error' });
    }
})
app.get('/books/issued-in-range', async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const transactions = await Transection.find({
            issuedate: { $gte: start, $lte: end },
            returndate: null
        })
        .populate('bookid', 'name')
        .populate('userid', 'name email mobileno');
        console.log(transactions)
        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No books found for the given date range' });
        }

        const result  = transactions.map(transaction => ({
            book: {
                name: transaction.bookid
            },
            issuedTo: transaction.userid,
            issuedate: transaction.issuedate
        }));

        return res.json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
})