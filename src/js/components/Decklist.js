import React from 'react';


export default class Decklist extends React.Component {
	render() {

		const CardIndividualItem = props => {
			return (
				<ul>
					{props.cards.cards.map((card, index) => (
						<li key={card.card.name + index}>
							{card.duplicates}x - {card.card.name}
						</li>
					))}
				</ul>
			)
		};

		const CardTypeItem = props => {
			return (
				<div>
					{Object.keys(props.types).map(function(typeKey) {
						var type = props.types[typeKey];
						return (
							<div key={typeKey}>
								<h4>{typeKey} - {type.total}</h4>
								<CardIndividualItem cards={type} />
							</div>
						);
					 })}
				</div>
			)
		};

		const CardColorItem = props => {
			return (
				<div>
					{props.decklist.map((color) => (
						<div key={color.color}>
							<h3>{color.color} - {color.size}</h3>
							<CardTypeItem types={color.cards} />
						</div>
					))}
				</div>
			)
		};

        return (
        	<div class='row'>
        		<div class='small-12 columns'>
					<CardColorItem decklist={this.props.decklist} />
				</div>
			</div>
        );
 	}
 }
