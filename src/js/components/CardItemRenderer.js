import React from 'react';

export default class CardItemRenderer extends React.Component {
	constructor() {
		super();
		this.state = {
			timer: null,
			displayPackshot: false
		};
	}

	handleMouseOver(event) {
		this.state.timer = setTimeout(function () {
			this.setState({displayPackshot: true});
		}.bind(this), 200);
	}

	handleMouseOut(event) {
		clearTimeout(this.state.timer);
		this.setState({displayPackshot: false});
	}

	render() {

		const CardPackshot = props => {
			var imageUrl = props.display ? _.head(props.card.editions).image_url : '',
				display = props.display ? '' : 'hidden';
			return (
				<div class={'card-packshot ' + display} >
					<img src={imageUrl}></img>
					<div class='arrow-left'></div>
				</div>
			)
		};

		return (
			<li class='card-item-renderer'>
				{this.props.card.duplicates}x -&nbsp;
				<a class='card-title-link' href={this.props.card.card.store_url} target='_blank' onMouseOver={this.handleMouseOver.bind(this)} onMouseOut={this.handleMouseOut.bind(this)}>
					{this.props.card.card.name}
					<CardPackshot card={this.props.card.card} display={this.state.displayPackshot} />
				</a>
			</li>
		);
	}
 }
