import React from 'react';
import { withRouter  } from 'react-router';
import ReactDOM from 'react-dom';

import auth from '../../auth';


const TagsVariants = React.createClass({
  render() {
    const data = this.props.data;

    return (
      <div className="tags-variants">
        {data.map((item, index) => 
          <span key={index}>
            <a onClick={this.props.onAddNewTag} href="#"><b>{item.name}</b> ({item.popular})</a>&nbsp;
          </span>
        )}
        
      </div>
    );
  }
});

const Tag = React.createClass({
  render() {
    return (
      <a href="#" onClick={this.props.onTagClick} className="post-tag">{this.props.name}</a>
    );
  }
});

const SelectedTags = React.createClass({
  render() {
    const data = this.props.data;

    return (
      <div className="tags-label">
        <b>Теги:</b>&nbsp;
        <div className="tags">
          {data.map((item, index) => 
            <span key={index}>
              <Tag name={item} onTagClick={this.props.onTagClick} />
            </span>
          )}
        </div>
      </div>
    );
  }
});

const AddQuestionPage = withRouter(
  React.createClass({
    getInitialState() {
      return {
        error: false,
        message: '',
        tags: [],
        findedTags: [],
        inputValue: ''
      }
    },

    handleSubmit(event) {
      event.preventDefault();

      const title = this.refs.title.value.trim();
      const comment = this.refs.comment.value.trim();
      const tags = this.state.tags.join(',');

      $.ajax({
        type: 'POST',
        url: `${window.config.basename}/api/question`,
        contentType: 'application/json',
        data: JSON.stringify({ title, comment, tags }),
        success: data => {
          console.log(data);
          if (data.msg) {
            const { location } = this.props

            if (location.state && location.state.nextPathname) {
              this.props.router.replace(location.state.nextPathname)
            } else {
              this.props.router.replace(`/questions/${data.msg}`)
            }
          } else {
            console.error(data);
          }
        },
        error: (xhr, status, err) => {
          console.error(status, err.toString());
        }
      });

      return false;
    },

    onChange(e) {
      // e.preventDefault();

      var searchedTerm = ReactDOM.findDOMNode(this.refs.searched).value.trim();
      this.setState({ inputValue: searchedTerm });
      if (!searchedTerm) {
        this.setState({ findedTags: [] });
        return;
      }

      $.ajax({
        type: 'POST',
        // data: { q: text }
        url: `${window.config.basename}/api/tags/${searchedTerm}`,
        contentType: 'application/json',
      })
      .done(response => {
        if (response) {
          console.log(JSON.stringify(response));
          const findedTags = response;
          this.setState({ findedTags });
        }
      });

      
    },

    addNewTag(e) {
      event.preventDefault();
      var tag = ReactDOM.findDOMNode(this.refs.searched).value.trim();
      this.addTag(tag);
      return false;
    },

    addTag(tag) {
      console.log(`new tag: ${tag}`);
      if (tag) {
        if (this.state.tags.indexOf(tag) === -1) {
          this.setState({ tags: [tag].concat(this.state.tags) });
        }
        this.setState({ inputValue: '', findedTags: [] });
      }
    },

    onAddNewTag(event) {
      event.preventDefault()
      const that = event.currentTarget;

      var tag = $(that).find('b').text(); // .replace(/[^a-zA-ZА-Яа-яЁё0-9-_]+/g,'');
      this.addTag(tag);
    },

    onTagClick(event) {
      console.log('delete tag!');

      event.preventDefault()
      const that = event.currentTarget;

      var deletedTag = $(that).text();
      if (this.state.tags.indexOf(deletedTag) !== -1) {

        const newTags = this.state.tags.filter(name => name !== deletedTag);
        this.setState({ tags: newTags })

        // tagsArray.splice(tagsArray.indexOf(deletedTag), 1);
        console.log(JSON.stringify(this.state.tags));
      }
    },

    render() {

      const tags = this.state.tags;

      return (
        <div>
          <h1>Добавить вопрос</h1>
            <form onSubmit={this.handleSubmit}>
              Название вопроса: <input ref="title" type="text" name="title" required="required" /><br />
              Описание: <textarea ref="comment" name="comment" required="required" /><br />
              
              Добавить тег: 
              <input 
                id="add-tag"
                type="text"
                ref='searched'
                value={this.state.inputValue}
                onChange={this.onChange}
                placeholder="Введите тег" /> <a href="#" onClick={this.addNewTag}>Добавить новый тэг</a>
              
              <TagsVariants onAddNewTag={this.onAddNewTag} data={this.state.findedTags} />
              <SelectedTags onTagClick={this.onTagClick} data={tags} />
              <br />
              <button type="submit">Добавить вопрос</button>
              {this.state.error && (
                <p>{this.state.message}</p>
              )}
            </form>
        </div>
      )
    }
  })
);

export default AddQuestionPage;