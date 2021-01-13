const express=require('express')
const { restart } = require('nodemon')
const router=express.Router()
const Posts=require('./db-helpers')

router.get('/', (req,res)=>{
Posts.find()
    .then(posts=>{
        res.status(200).json(posts)
    })
    .catch(error=>{
        console.log(error)
        res.status(500).json ({error:"The posts information could not be retrieved."})
    })
})

router.get('/:id',(req,res)=>{
    Posts.findById(req.params.id)
    .then(post=>{
        if(post.length===0){
            res.status(404).json({error: "The post with the specified ID does not exist." })
        }
        else{
        res.status(200).json(post); 
        }
    })
    .catch(error=>{
        console.log(error)
        res.status(500).json ({error:"The posts information could not be retrieved."})
    })
})

router.get('/:id/comments',(req,res)=>{
Posts.findPostComments(req.params.id)
    .then(comments=>{
        if(comments.length===0){
            res.status(404).json({error: "The post with the specified ID does not exist, or it has no comments." })
        }
        else{
            res.status(200).json(comments)
        }
    })
    .catch(error=>{
        console.log(error)
        res.status(500).json ({error:"The comments could not be retrieved."})
    })
})

router.post('/',(req,res)=>{
    const post=req.body
    if(!post.title || !post.contents)
    {res.status(400).json ({errorMessage:"Please provide title and contents for the post."})
    }
    else{
        Posts.insert(post)
        .then(postId=>{
            res.status(201).json(postId)
        })
        .catch(error=>{
            console.log(error)
            res.status(500).json ({error: "There was an error while saving the post to the database" })
        })
    }
})

router.post('/:id/comments', (req,res)=>{
    const comment=req.body
    if(!comment.text){
        res.status(400).json ({errorMessage: "Please provide text for the comment."})
    }
    else{
        Posts.insertComment(comment)
        .then(commentId=>{
            res.status(201).json(commentId)
        })
        .catch(error=>{
            console.log(error)
            if(error.errno===19){
                res.status(404).json ({message: "The post with the specified ID does not exist."})
            }

            else{res.status(500).json ({error: "There was an error while saving the comment to the database" })}
        })
    }
})

router.put('/:id', (req,res)=>{
    const editedPost=req.body
    const postId=req.params.id
    if(!editedPost.title || !editedPost.contents){
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
    }
    else{Posts.update(postId, editedPost)
        .then(updateCount=>{
            if (updateCount===1){
            res.status(200).json(editedPost)}
            else{res.status(404).json({ message: "The post with the specified ID does not exist." })}
        })
        .catch(error=>{
            console.log(error)
            res.status(500).json({error: "The post information could not be modified."})
        })
    
    }

})

router.delete('/:id',(req,res)=>{
Posts.findById(req.params.id)
    .then(post=>{
        if(post.length===0){
            res.status(404).json({error: "The post with the specified ID does not exist." })
        }
        else{Posts.remove(post[0].id)
            .then(deleted=>{
                if(deleted===1){
                    res.status(200).json(post)
                }
                else{
                    res.status(500).json ({error: "The post could not be removed"})
                }
            })
            .catch(error=>{
                console.log(error)
                res.status(500).json ({error: "The post could not be removed"})
        
            })
        }
    })
    .catch(error=>{
        console.log(error)
        res.status(500).json ({error:"The posts information could not be retrieved."})
    })
})

module.exports=router