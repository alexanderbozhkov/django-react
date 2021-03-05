from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'code', 'host', 'guest_can_pause',
                  'votes_to_skip', 'created_at')


class CreateRoomSerializer(serializers.ModelSerializer):
    votes_to_skip = serializers.IntegerField(allow_null=False)

    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip')


class UpdateRoomSerializer(CreateRoomSerializer):
    code = serializers.CharField(validators=[])

    class Meta(CreateRoomSerializer.Meta):
        fields = ('guest_can_pause', 'votes_to_skip', 'code')
