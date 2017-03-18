import React from 'react';

import CardItemRenderer from './CardItemRenderer';

export default class Decklist extends React.Component {
	render() {

		const CardIndividualItem = props => {
			return (
				<ul class='type-cards'>
					{props.cards.cards.map((card, index) => (
						<CardItemRenderer card={card} key={card.card.name + index}/>
					))}
				</ul>
			)
		};

		const CardTypeItem = props => {
			return (
				<div class='row color-cards'>
					{Object.keys(props.types).map(function (typeKey) {
						var type = props.types[typeKey];
						if (type.total === 0) {
							return null;
						} else {
							return (
								<div class='small-12 medium-4 columns type-container' key={typeKey}>
									<h4>{typeKey} ({type.total})</h4>
									<CardIndividualItem cards={type} />
								</div>
							);
						}
					 })}
				</div>
			)
		};

		return (
			<div class='deck-list'>
				{this.props.decklist.map((color) => (
					<div class='row color-container' key={color.color}>
						<div class='small-12 columns'>
							<h3>{color.color} ({color.size})</h3>
							<CardTypeItem types={color.cards} />
						</div>
					</div>
				))}
			</div>
		);
	}
 }
