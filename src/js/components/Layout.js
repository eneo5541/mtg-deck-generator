import React from 'react';

import ColorPicker from './ColorPicker';
import Decklist from './Decklist';
import SizeSelector from './SizeSelector';

export default class Layout extends React.Component {
	constructor() {
		super();
		this.state = {
			sizes: [60, 40],
			selectedSize: 60,
			colors: ['black', 'white', 'red', 'green', 'blue'],
			selectedColors: [],
			decklist: []
		};
	}

	randomInt (variance) {
		return Math.floor(Math.random() * variance);
	}

	offset (variance) {
		return this.randomInt(variance) * (Math.round(Math.random()) * 2 - 1);
	}

	changeSelectedColors (selectedColors) {
		this.setState({selectedColors});
	}

	changeSelectedSize (selectedSize) {
		this.setState({selectedSize});
	}

	changeDecklist (decklist) {
		this.setState({decklist});
	}

	getColorDistribution (totalCards, selectedColors) {
		var cardsPerColor = Math.floor(totalCards / selectedColors.length),
			cardDistribution = _.map(selectedColors, (color) => {
				var cardCount = cardsPerColor + this.offset(5);
				if (cardCount < totalCards) {
					totalCards -= cardCount;
				} else {
					cardCount = totalCards;
					totalCards = 0;
				}
				return { 'color': color, 'size': cardCount };
			});
		cardDistribution.push({ 'color': 'artifact', 'size': totalCards });

        _.each(cardDistribution, this.getTypeDistribution.bind(this));
        return cardDistribution;
	}

	getTypeDistribution (color) {
		const totalCards = color.size,
			cardType = { 'color': color.color, 'total': 0, 'cards': [] };
		if (color.color === 'artifact') {
			color.cards = {
				'artifact': {
					__proto__: cardType,
					color: '',
					total: color.size
				}
			};
		} else {
			color.cards = {
				'land': {
					__proto__: cardType,
					'total': Math.floor(color.size * 0.4) + this.offset(3),
					'cards': []
				},
				'creature': {
					__proto__: cardType,
					'total': Math.floor(color.size * 0.3) + this.offset(3),
					'cards': []
				},
				'instant': {
					__proto__: cardType,
					'total': Math.floor(color.size * 0.15) + this.offset(3),
					'cards': []
				},
				'sorcery': {
					__proto__: cardType,
					'cards': []
				}
			};
			color.cards.sorcery.total = totalCards - (color.cards.land.total + color.cards.creature.total + color.cards.instant.total)
		}

        _.each(color.cards, this.getCardData.bind(this));
	}

	getCardData (data, index) {
		if (data.total > 0) {
			var url = '';
			if (index !== 'land') {
				const color = data.color ? `&color=${data.color}` : '',
					type = index ? `&type=${index}` : '';
				url = `https://api.deckbrew.com/mtg/cards?format=standard${color}${type}`;
			} else {
				const landMapping = {
						'white': 'plains',
						'black': 'swamp',
						'red': 'mountain',
						'blue': 'island',
						'green': 'forest'
					};
				url = `https://api.deckbrew.com/mtg/cards?type=land&supertype=basic&name=${landMapping[data.color]}`;
			}

			this.makeRequest(url)
				.then(function (response) {
					var cards = JSON.parse(response);
					var totalCards = data.total;
					while (totalCards > 0) {
						var cardIndex = this.randomInt(cards.length),
							cardData = cards[cardIndex],
							cardDuplicates = this.randomInt(4) + 1;
						if (cardDuplicates > totalCards) {
							cardDuplicates = totalCards;
						}
						data.cards.push({
							'card': cardData,
							'duplicates': cardDuplicates
						});
                        totalCards -= cardDuplicates;
                    }
				}.bind(this))
				.catch(function (err) {
					console.error('Error:', err.statusText);
				});
		}
	}

	buildDeck () {
		var newDecklist = this.getColorDistribution(this.state.selectedSize, this.state.selectedColors);
		this.changeDecklist(newDecklist);
	}

	makeRequest (url) {
		return new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.onload = function () {
				if (this.status >= 200 && this.status < 300) {
					resolve(xhr.response);
				} else {
					reject({
						status: this.status,
						statusText: xhr.statusText
					});
				}
			};
			xhr.onerror = function () {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			};
			xhr.send();
		});
    }

	render() {
		return (
			<div>
				<div class='row'>
					<div class='small-12 columns'>
						<div class='deck-properties'>
							<SizeSelector changeSelectedSize={this.changeSelectedSize.bind(this)} sizes={this.state.sizes}/>
							<ColorPicker changeSelectedColors={this.changeSelectedColors.bind(this)} colors={this.state.colors}/>
							<a class='button' onClick={this.buildDeck.bind(this)}>Build</a>
						</div>
					</div>
				</div>
				<div class='row'>
					<div class='small-12 columns'>
						<div class='deck-list'>
							<Decklist decklist={this.state.decklist}/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
