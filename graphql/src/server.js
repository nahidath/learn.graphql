
const { GraphQLScalarType, Kind } = require('graphql');
const { ApolloServer, gql } = require('apollo-server');
const url = require("url");

const typeDefs = gql`
  type User {
    id: Int
    name: String
    email: String
  }
  
  scalar Date
 
  type Post{
      id: Int
      author: User
      comments: [Post!]!
      content: String
      createdAt: Date
      updatedAt: Date
  }
  
  input UserInput {
    name: String!
    email: String!
  }
  
  type Query {
    allusers: [User!]!
    allPosts: [Post!]!
    onePost(id: Int): Post!
  }
  
  type Mutation {
    createUser(name: String!, email: String!): User!
    createPost(input: UserInput!, content: String!): Post!
    updatePost(Postid: Int!, content: String!): Post!
    deletePost(id: Int!): String!
  }
  
  type Subscription {
    newPerson: User!
  }
`;

const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value) {
        return value.getTime(); // Convert outgoing Date to integer for JSON
    },
    parseValue(value) {
        return new Date(value); // Convert incoming integer to Date
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
        }
        return null; // Invalid hard-coded value (not an integer)
    },
});

const users = [
    {
        id: 1,
        email: 'nahidath@gmail.com',
        post: {
            id: 1

        }
    },
    {
        id: 2,
        email: 'loïc@gmail.com',
        post: {
            id: 2
        }
    },
];

const posts = [
    {
        id: 1,
        author: {
            id: 1,
            name: 'nahi',
            email: 'nahidath@gmail.com'
        },
        content: 'first post',
        createdAt: '22-10-2021'
    },
    {
        id: 2,
        author: {
            id: 2,
            name: 'le L',
            email: 'loïc@gmail.com'
        },
        content: 'second post',
        createdAt: '22-10-2021'
    },
];

const  resolvers = {
    Date: dateScalar,
    Query : {
        allusers : () => users,
        allPosts: () => posts,
        onePost : (root, args) =>{
            return posts.find(onePost => onePost.id === args.id);
        },
        //books : () => db.book.findMany()
        /*author : () =>{
            /**
             * name : String
             * age : Int
             * ...
             */
            /*return fetch('http://api.author/')
        }*/


    },
    Mutation : {

        createUser : (parents, args) => {
            let idCount = users.length
            const newuser = {
                id : idCount+1,
                name : args.name,
                email : args.email,
            }
            users.push(newuser)
            return newuser
        },
        createPost : (_, {input, content}) => {
            let idCount = posts.length;
            const newpost = {
                id : idCount+1,
                author : {
                    name : input.name,
                    email : input.email,
                },
                content : content,
            }
            posts.push(newpost)
            return newpost
        },
        updatePost : (_, { Postid, content }) => {
            const updatepost = posts.find( updatePost => updatePost.id === Postid);
            if (!updatepost) {
                throw new Error(`Couldn’t find post with id ${Postid}`);
            }
            updatepost.content = content;
            return updatepost;
        },
        deletePost : (root, args) => {
            const deletepost = posts.find( deletePost => deletePost.id === args.id);
            if (!deletepost) {
                throw new Error(`Couldn’t find post with id ${Postid}`);
            }
            posts.pop(deletepost)
            return "Post with id ${Postid} deleted"
        }
    }


};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});




