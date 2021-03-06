import React from 'react';
import AddPost from './Posts/AddPost/AddPost';
import Posts from './Posts/Posts';
import { withRouter } from 'react-router-dom';
import API from '../../../Helpers/api';
import classes from './Board.module.css';
import { Link } from 'react-router-dom';

class Board extends React.Component {
  state = {
    boardData: [],
    posts: [],
    showPostTexbox: false,
    visibleTemplateColumnId: 0,
    editPost: false,
    editPostId: 0,
    editingPostContent: '',
  };

  submitPostHandler = (post, templateColumnId) => {
    const currentState = this.state.posts;
    const postData = {
      content: post,
      user_id: 1,
      board_id: this.state.boardData[0].id,
      template_id: this.state.boardData[0].template,
      template_column_id: templateColumnId,
    };

    if (!this.state.editPost) {
      API.post(`boards/submitPost/`, postData).then(res => {
        currentState.push(res.data[0]);
        this.setState({ posts: currentState });
        this.toggleAddPost(false, templateColumnId);
      });
    } else {
      postData.id = this.state.editPostId;
      API.put(`boards/updatePost/`, postData).then(res => {
        currentState.filter(post => post.id !== postData.id);
        currentState.push(res.data[0]);
        this.setState({ posts: currentState });
        this.toggleAddPost(false, templateColumnId);
      });
    }
  };

  deletePostHandler = postId => {
    const currentState = [...this.state.posts];
    API.delete(`boards/deletePost/${postId}`).then(res => {
      this.setState({ posts: currentState.filter(post => post.id !== postId) });
    });
  };

  editPostHandler = postId => {
    const currentPostState = [...this.state.posts];
    const currentPost = currentPostState.filter(post => post.id === postId);
    this.toggleAddPost(true, currentPost[0].template_column_id);
    this.setState({ editPost: true, editPostId: currentPost[0].id, editingPostContent: currentPost[0].content });
  };

  componentDidMount() {
    this.fetchBoardData();
  }

  fetchBoardData() {
    const boardId = this.props.match.params.id;
    API.get(`boards/fetchById/${boardId}`).then(res => {
      this.setState({ boardData: res.data });
      this.setState({ posts: this.state.boardData[0].posts });
    });
  }

  toggleAddPost(flag, columnId) {
    this.setState({ showPostTexbox: flag, visibleTemplateColumnId: columnId });
  }

  render() {
    return (
      <section className='section'>
        <div className='container'>
          <div className='content'>
            <Link to='/dashboard'>
              <span className='icon'>
                <i className='fas fa-arrow-left'></i>
              </span>
              <span> Back to dashboard</span>
            </Link>
            <h1 className={`title ${classes.Title}`}>
              {this.state.boardData.length > 0 && this.state.boardData[0].name}
            </h1>
            <p className={`subtitle ${classes.CreatedBy}`}>
              Created by: {this.state.boardData.length > 0 && this.state.boardData[0].username} @{' '}
              {this.state.boardData.length > 0 && this.state.boardData[0].created_at}
            </p>
          </div>
          <div className='columns'>
            {this.state.boardData.length > 0 &&
              this.state.boardData[0].template_columns.map(column => (
                <div className='column' key={column.id}>
                  <nav className='panel'>
                    <p className='panel-heading'>{column.name}</p>
                    <Posts
                      posts={this.state.posts}
                      templateColumnId={column.id}
                      deletePostHandler={this.deletePostHandler}
                      editPostHandler={this.editPostHandler}
                    />
                    <AddPost
                      toggle={this.state.showPostTexbox}
                      templateColumnId={column.id}
                      visibleTemplateColumnId={this.state.visibleTemplateColumnId}
                      editingPostContent={this.state.editingPostContent}
                      submit={this.submitPostHandler}
                      cancel={() => this.toggleAddPost(false)}
                      add={() => this.toggleAddPost(true, column.id)}
                    />
                  </nav>
                </div>
              ))}
          </div>
        </div>
      </section>
    );
  }
}

export default withRouter(Board);
