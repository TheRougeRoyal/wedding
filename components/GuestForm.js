'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrainFront, Plane, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GuestForm({ onAddGuest, onCancel, isSubmitting: externalSubmitting }) {
  const [travelMode, setTravelMode] = useState('train');
  const [formData, setFormData] = useState({
    name: '',
    trainNumber: '',
    flightNumber: '',
    journeyDate: '',
    reminderHoursBefore: '2',
    peopleCount: '1',
  });
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [travelData, setTravelData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    if (name === 'trainNumber' || name === 'flightNumber') {
      setTravelData(null);
    }
  };

  const handleFetchStatus = async () => {
    const lookupValue = travelMode === 'train' ? formData.trainNumber : formData.flightNumber;
    if (!lookupValue.trim()) {
      setError(`Enter a ${travelMode === 'train' ? 'train' : 'flight'} number`);
      return;
    }

    setIsLookingUp(true);
    setError('');
    setTravelData(null);

    try {
      const endpoint = travelMode === 'train' ? '/api/train/status' : '/api/flight/status';
      const body = travelMode === 'train'
        ? { trainNumber: lookupValue }
        : { flightNumber: lookupValue };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setTravelData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError('Enter a guest name');
    if (!travelData) return setError(`Fetch ${travelMode} status first`);

    setIsSubmitting(true);

    try {
      const base = {
        name: formData.name,
        travelMode,
        reminderHoursBefore: Number(formData.reminderHoursBefore),
        journeyDate: formData.journeyDate,
        peopleCount: Number(formData.peopleCount),
      };

      const guest = travelMode === 'train'
        ? {
            ...base,
            trainNumber: travelData.trainNumber,
            trainName: travelData.trainName,
            origin: travelData.origin,
            destination: travelData.destination,
            currentStation: travelData.currentStation,
            nextStop: travelData.nextStop,
            nextStopTime: travelData.nextStopTime,
            status: travelData.status,
            delayMinutes: travelData.delayMinutes,
          }
        : {
            ...base,
            flightNumber: travelData.flightNumber,
            flightIcao: travelData.flightIcao,
            airline: travelData.airline,
            airlineIata: travelData.airlineIata,
            origin: travelData.origin,
            originName: travelData.originName,
            destination: travelData.destination,
            destinationName: travelData.destinationName,
            departureTime: travelData.departureTime,
            arrivalTime: travelData.arrivalTime,
            departureTerminal: travelData.departureTerminal,
            departureGate: travelData.departureGate,
            arrivalTerminal: travelData.arrivalTerminal,
            arrivalGate: travelData.arrivalGate,
            status: travelData.status,
            delayMinutes: travelData.delayMinutes,
            aircraft: travelData.aircraft,
          };

      onAddGuest(guest);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      {/* Guest Name */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs font-medium sm:text-sm">Guest Name</label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter guest name"
          className="h-10 sm:h-9"
        />
      </div>

      {/* Number of People */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs font-medium sm:text-sm">Number of People</label>
        <div className="flex gap-2">
          <Input
            name="peopleCount"
            type="number"
            min="1"
            max="8"
            value={formData.peopleCount}
            onChange={handleChange}
            className="h-10 w-20 sm:h-9"
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>
              {Number(formData.peopleCount) <= 2
                ? '1 room'
                : `${Math.ceil(Number(formData.peopleCount) / 2)} rooms`
              }
            </span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground sm:text-xs">
          Families will be assigned adjacent rooms
        </p>
      </div>

      {/* Travel Mode */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs font-medium sm:text-sm">Travel Mode</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'train', label: 'Train', icon: TrainFront },
            { value: 'flight', label: 'Flight', icon: Plane },
          ].map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => { setTravelMode(m.value); setTravelData(null); setError(''); }}
              className={cn(
                'flex items-center justify-center gap-2 rounded-md border p-2.5 text-xs font-medium transition-colors sm:p-3 sm:text-sm',
                travelMode === m.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-input text-muted-foreground hover:bg-accent'
              )}
            >
              <m.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Number + Fetch */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs font-medium sm:text-sm">
          {travelMode === 'train' ? 'Train Number' : 'Flight Number (IATA)'}
        </label>
        <div className="flex gap-2">
          <Input
            name={travelMode === 'train' ? 'trainNumber' : 'flightNumber'}
            value={travelMode === 'train' ? formData.trainNumber : formData.flightNumber}
            onChange={handleChange}
            placeholder={travelMode === 'train' ? 'e.g. 19038' : 'e.g. 6E2001'}
            className="h-10 flex-1 sm:h-9"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleFetchStatus}
            disabled={isLookingUp}
            className="h-10 shrink-0 px-3 sm:h-9"
          >
            {isLookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
          </Button>
        </div>

        {/* Fetched Data Preview */}
        {travelData && (
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-3 space-y-1 text-xs sm:p-4 sm:space-y-1.5 sm:text-sm">
              {travelMode === 'train' ? (
                <>
                  <p className="font-medium">{travelData.trainName} ({travelData.trainNumber})</p>
                  <p className="text-muted-foreground">{travelData.origin} → {travelData.destination}</p>
                  {travelData.currentStation && <p className="text-muted-foreground">Current: {travelData.currentStation}</p>}
                  {travelData.nextStop && <p className="text-muted-foreground">Next: {travelData.nextStop} {travelData.nextStopTime}</p>}
                  <p className="text-muted-foreground">Status: {travelData.status}</p>
                  {travelData.delayMinutes > 0 && (
                    <p className="text-destructive text-xs font-medium">Delayed by {travelData.delayMinutes} min</p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-medium">{travelData.airline} ({travelData.flightNumber})</p>
                  <p className="text-muted-foreground">{travelData.originName || travelData.origin} → {travelData.destinationName || travelData.destination}</p>
                  {travelData.departureTime && (
                    <p className="text-muted-foreground">Departs: {new Date(travelData.departureTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  )}
                  {travelData.arrivalTime && (
                    <p className="text-muted-foreground">Arrives: {new Date(travelData.arrivalTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  )}
                  <p className="text-muted-foreground">Status: {travelData.status}</p>
                  {travelData.delayMinutes > 0 && (
                    <p className="text-destructive text-xs font-medium">Delayed by {travelData.delayMinutes} min</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Journey Date */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs font-medium sm:text-sm">Journey Date</label>
        <Input
          type="date"
          name="journeyDate"
          value={formData.journeyDate}
          onChange={handleChange}
          className="h-10 sm:h-9"
        />
      </div>

      {/* Reminder */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs font-medium sm:text-sm">Remind before arrival</label>
        <Select
          value={formData.reminderHoursBefore}
          onValueChange={(val) => setFormData(prev => ({ ...prev, reminderHoursBefore: val }))}
        >
          <SelectTrigger className="h-10 sm:h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5">30 minutes</SelectItem>
            <SelectItem value="1">1 hour</SelectItem>
            <SelectItem value="2">2 hours</SelectItem>
            <SelectItem value="3">3 hours</SelectItem>
            <SelectItem value="6">6 hours</SelectItem>
            <SelectItem value="12">12 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1 sm:pt-2">
        <Button type="submit" disabled={isSubmitting || externalSubmitting} className="h-10 flex-1 sm:h-9">
          {(isSubmitting || externalSubmitting) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {(isSubmitting || externalSubmitting) ? 'Adding...' : 'Add Guest'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="h-10 px-4 sm:h-9">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
