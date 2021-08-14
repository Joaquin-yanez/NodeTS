// An advantage above using js in node is that ts supports ES6 import system.
import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, Application } from 'express';
import { Sequelize, Model, DataTypes } from 'sequelize';

// From @types/express we get the Application, Request and Response interfaces for type checking.
const app: Application = express();

const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
        host: process.env.DB_URL,
        port: process.env.DB_PORT as unknown as number,
        dialect: 'mysql'
    }
);

class User extends Model {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public name!: string;
    public preferredName!: string | null; // for nullable fields
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false
        },
        preferredName: {
            type: new DataTypes.STRING(128),
            allowNull: true
        }
    },
    {
        tableName: 'users',
        sequelize // passing the `sequelize` instance is required
    }
);

app.get('/', (req: Request, res: Response): void => {
    res.send('Hello World with Typescript!');
});

app.get('/users', async (req: Request, res: Response): Promise<void> => {
    // Checks the db connection
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    const users = await User.findAll({
        attributes: [
            ['name', 'Real Name'],
            ['preferredName', 'Nickname']
        ]
    });

    if (users) {
        res.status(200).json(users);
    } else {
        res.status(404).json('There are no users in database');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, (): void => {
    console.log(`Running at 👉 https://localhost:${PORT}`);
});
