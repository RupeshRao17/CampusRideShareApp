import { useState } from 'react';
import { View, TextInput } from 'react-native';

type Props = {
  placeholder: string;
  onSelect: (value: { label: string; lat?: number; lon?: number }) => void;
};

export default function SearchBar({ placeholder, onSelect }: Props) {
  const [query, setQuery] = useState('');
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 12, paddingVertical: 8 }}>
      <TextInput
        placeholder={placeholder}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={async () => {
          if (!query.trim()) return;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
            const data = await res.json();
            const first = data?.[0];
            onSelect({ label: query, lat: first ? parseFloat(first.lat) : undefined, lon: first ? parseFloat(first.lon) : undefined });
          } catch {}
        }}
      />
    </View>
  );
}