'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser } from '@/lib/hooks/useUser';
import { useAuth } from '@/lib/hooks/useAuth';
import { dataService } from '@/services/dataService';
import { getUserTeams } from '@/services/fantasyService';
import { Event, FantasyTeam } from '@/types';

export default function FantasyPage() {
	const { isAuthenticated } = useUser();
	const { user } = useAuth();
	const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
	const [myRecentTeams, setMyRecentTeams] = useState<FantasyTeam[]>([]);
	const [loading, setLoading] = useState(true);
	const [teamsLoading, setTeamsLoading] = useState(false);

	useEffect(() => {
		fetchUpcomingEvents();
	}, []);

	useEffect(() => {
		if (user) {
			fetchMyRecentTeams();
		}
	}, [user]);

	const fetchUpcomingEvents = async () => {
		try {
			setLoading(true);
			const upcoming = await dataService.getUpcomingEvents(10);
			setUpcomingEvents(upcoming);
		} catch (error) {
			console.error('Error fetching events:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchMyRecentTeams = async () => {
		if (!user) return;
		try {
			setTeamsLoading(true);
			const teams = await getUserTeams(user.uid);
			const recentTeams = teams
				.sort((a, b) => {
					const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
					const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
					return dateB - dateA;
				})
				.slice(0, 3);
			setMyRecentTeams(recentTeams);
		} catch (error) {
			console.error('Error fetching user teams:', error);
		} finally {
			setTeamsLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { 
			month: 'short', 
			day: 'numeric', 
			year: 'numeric' 
		});
	};

	const getContestDetails = (event: Event) => {
		const isPPV = event.type === 'PPV';
		return {
			prizePool: isPPV ? '$15,000' : '$5,000',
			entryFee: isPPV ? '$20' : '$10',
			entries: isPPV ? '3,456' : '1,234',
		};
	};

	const getTeamStatusBadge = (status: string) => {
		switch (status) {
			case 'draft':
				return <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">Draft</span>;
			case 'submitted':
				return <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Submitted</span>;
			case 'locked':
				return <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">Locked</span>;
			case 'scored':
				return <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Scored</span>;
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-black">
			<Navigation />
			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-8 mb-8 border border-gray-700">
					<h1 className="text-5xl font-bold mb-4 text-white">Fighter Fantasy</h1>
					<p className="text-xl text-gray-300 mb-6">
						Make your picks for each main-card fight and compete on the leaderboard.
					</p>
					{isAuthenticated ? (
						upcomingEvents.length > 0 ? (
							<Link href={`/fantasy/team-builder/${upcomingEvents[0].id}`}>
								<Button className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 text-lg">
									Build Your Team →
								</Button>
							</Link>
						) : (
							<Button disabled className="bg-gray-600 text-gray-300 font-bold px-6 py-3 text-lg cursor-not-allowed">
								No Events Available
							</Button>
						)
					) : (
						<Link href="/signup">
							<Button className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 text-lg">
								Sign Up to Play →
							</Button>
						</Link>
					)}
				</div>

				<section className="mb-12">
					<h2 className="text-3xl font-bold mb-6 text-white">How It Works</h2>
					<div className="grid md:grid-cols-3 gap-6">
						<Card className="bg-gray-900 border-gray-800">
							<CardHeader>
								<div className="text-3xl mb-3">📋</div>
								<CardTitle className="text-xl text-white">1. Make Your Picks</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-gray-400">
									Pick one fighter per main-card fight. Add method and round for extra points.
								</CardDescription>
							</CardContent>
						</Card>
						<Card className="bg-gray-900 border-gray-800">
							<CardHeader>
								<div className="text-3xl mb-3">🥊</div>
								<CardTitle className="text-xl text-white">2. Score Points</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-gray-400">
									Points come from correct winner/method/round, capped performance, rarity and underdog bonuses.
								</CardDescription>
							</CardContent>
						</Card>
						<Card className="bg-gray-900 border-gray-800">
							<CardHeader>
								<div className="text-3xl mb-3">🏆</div>
								<CardTitle className="text-xl text-white">3. Win</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-gray-400">
									Climb the event leaderboard. Captain boosts one pick ×1.25. Coins bets are optional.
								</CardDescription>
							</CardContent>
						</Card>
					</div>
				</section>

				<section className="mb-12">
					<h2 className="text-3xl font-bold mb-6 text-green-500">Upcoming Contests</h2>
					{loading ? (
						<div className="flex justify-center items-center h-32">
							<div className="text-white text-lg">Loading contests...</div>
						</div>
					) : upcomingEvents.length > 0 ? (
						<div className="grid gap-4">
							{upcomingEvents.map(event => {
								const contestDetails = getContestDetails(event);
								return (
									<Card key={event.id} className="bg-gray-900 border-gray-800 hover:border-green-500 transition-colors">
										<CardContent className="p-6">
											<div className="flex items-center justify-between">
												<div>
													<h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
													<div className="flex gap-6 text-sm">
														<span className="text-gray-400">📅 {formatDate(event.date_utc)}</span>
														<span className="text-green-500 font-semibold">💰 {contestDetails.prizePool} Prize Pool</span>
													</div>
												</div>
												<div>
													<Link href={`/fantasy/team-builder/${event.id}`}>
														<Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2">Enter →</Button>
													</Link>
												</div>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					) : (
						<div className="text-gray-400">No upcoming contests found.</div>
					)}
				</section>
			</div>
		</div>
	);
} 